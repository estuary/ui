import type { ReactNode } from 'react';

import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { beforeEach, expect, test, vi } from 'vitest';

import { BillingContactSection } from 'src/components/admin/Billing/BillingContactSection';
import { STRIPE_LOAD_ERROR } from 'src/components/admin/Billing/stripe';
import { UrqlConfigProvider } from 'src/context/URQL';
import {
    austin,
    billingGraphql,
    completeContact,
    contactData,
    dropFetchSignals,
    emptyContact,
    handleContactSaves,
    incompleteContact,
} from 'src/test/billing';
import { HttpResponse, server } from 'src/test/server/test-server';

const stripe = vi.hoisted(() => ({
    getValue: vi.fn(),
    loaded: true,
    promise: Promise.resolve(null),
}));
vi.mock('src/stores/Tenant', () => ({
    useTenantStore: (
        selector: (state: { selectedTenant: string }) => unknown
    ) => selector({ selectedTenant: 'acme/' }),
}));
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: () => Promise.resolve(null),
}));
vi.mock('src/components/admin/Billing/stripe', async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    getStripe: () => stripe.promise,
}));
vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }: { children: ReactNode }) => children,
    AddressElement: () => null,
    useElements: () =>
        stripe.loaded
            ? { getElement: () => ({ getValue: stripe.getValue }) }
            : null,
}));

let contact = completeContact;
let contactReads = 0;

const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider locale="en">
        <UrqlConfigProvider>{children}</UrqlConfigProvider>
    </IntlProvider>
);

const openEditDialog = async () => {
    render(<BillingContactSection canEdit />, { wrapper });
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    return screen.findByRole('dialog');
};

beforeEach(() => {
    dropFetchSignals();
    contact = completeContact;
    contactReads = 0;
    stripe.getValue.mockReset();
    stripe.loaded = true;
    stripe.promise = Promise.resolve(null);
    server.use(
        billingGraphql.query('TenantBillingContact', () => {
            contactReads++;
            return HttpResponse.json({ data: contactData(contact) });
        })
    );
});

test.each([
    {
        status: 'complete',
        value: completeContact,
        text: [
            'Acme Corp',
            'billing@acme.co',
            '500 Howard St, San Francisco, CA 94105, United States',
        ],
        action: 'Edit',
    },
    {
        status: 'incomplete',
        value: incompleteContact,
        text: ['billing@acme.co', 'Missing organization name'],
        action: 'Finish',
    },
    {
        status: 'missing',
        value: emptyContact,
        text: [
            'Add the legal name and address to show on invoices and receipts.',
        ],
        action: 'Add billing contact',
    },
])('offers $action for a $status contact', async ({ value, text, action }) => {
    contact = value;
    render(<BillingContactSection canEdit />, { wrapper });
    await screen.findByRole('button', { name: action });
    text.forEach((line) => expect(screen.getByText(line)).toBeTruthy());
});

test('stops loading when the tenant read returns nothing', async () => {
    server.use(
        billingGraphql.query('TenantBillingContact', () =>
            HttpResponse.json({ data: { tenant: null } })
        )
    );
    render(<BillingContactSection canEdit />, { wrapper });

    await screen.findByRole('button', { name: 'Add billing contact' });
});

test('saves edits and shows them from the cache', async () => {
    const saves = handleContactSaves();
    const dialog = await openEditDialog();

    stripe.getValue.mockResolvedValue({
        ...austin,
        value: { ...austin.value, name: ' New Co ' },
    });
    fireEvent.change(within(dialog).getByLabelText('Billing email'), {
        target: { value: ' ap@newco.com ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saves).toEqual([
        {
            tenant: 'acme/',
            name: 'New Co',
            emails: ['ap@newco.com'],
            address: {
                line1: '1 Main St',
                line2: null,
                city: 'Austin',
                state: 'TX',
                postalCode: '78701',
                country: 'US',
            },
        },
    ]);
    expect(screen.getByText('New Co')).toBeTruthy();
    expect(
        screen.getByText('1 Main St, Austin, TX 78701, United States')
    ).toBeTruthy();
    // The mutation result updates the cache, so nothing is refetched.
    expect(contactReads).toBe(1);
});

test('saves only a complete address and a valid email', async () => {
    const saves = handleContactSaves();
    const dialog = await openEditDialog();
    const save = within(dialog).getByRole('button', { name: 'Save' });

    stripe.getValue.mockResolvedValue({ ...austin, complete: false });
    fireEvent.click(save);
    await waitFor(() => expect(stripe.getValue).toHaveBeenCalledTimes(1));

    stripe.getValue.mockResolvedValue(austin);
    fireEvent.change(within(dialog).getByLabelText('Billing email'), {
        target: { value: 'a@b' },
    });
    fireEvent.click(save);
    await within(dialog).findByText(
        'Enter one valid email, like billing@company.com'
    );
    expect(saves).toEqual([]);

    fireEvent.change(within(dialog).getByLabelText('Billing email'), {
        target: { value: 'ap@acme.co' },
    });
    fireEvent.click(save);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saves.map((saved) => saved.emails)).toEqual([['ap@acme.co']]);
});

test('saves additional emails after the billing email', async () => {
    contact = { ...completeContact, emails: ['billing@acme.co', 'ap@acme.co'] };
    const saves = handleContactSaves();
    const dialog = await openEditDialog();
    const save = within(dialog).getByRole('button', { name: 'Save' });
    const additional = within(dialog).getByLabelText(
        'Additional billing emails'
    );
    stripe.getValue.mockResolvedValue(austin);

    fireEvent.change(additional, { target: { value: 'pay@acme.co, oops' } });
    fireEvent.keyDown(additional, { key: 'Enter' });
    await within(dialog).findByText('Enter valid emails, like ap@company.com');
    expect(within(dialog).getByText('pay@acme.co')).toBeTruthy();
    fireEvent.click(save);
    await waitFor(() => expect(save.hasAttribute('disabled')).toBe(false));
    expect(saves).toEqual([]);

    // Text left in the box is saved, and a duplicate only once.
    fireEvent.change(additional, {
        target: { value: 'AP@acme.co team@acme.co' },
    });
    fireEvent.click(save);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saves.map((saved) => saved.emails)).toEqual([
        ['billing@acme.co', 'ap@acme.co', 'pay@acme.co', 'team@acme.co'],
    ]);
    // The section shows only the billing email.
    expect(screen.getByText('billing@acme.co')).toBeTruthy();
});

test('waits for Stripe to load before saving', async () => {
    stripe.loaded = false;
    const dialog = await openEditDialog();

    expect(
        within(dialog)
            .getByRole('button', { name: 'Save' })
            .hasAttribute('disabled')
    ).toBe(true);
});

test('says so when Stripe.js fails to load', async () => {
    stripe.loaded = false;
    stripe.promise = Promise.reject(new Error('blocked'));
    // The mocked Elements ignores the promise, so nothing else handles this rejection.
    void stripe.promise.catch(() => undefined);
    const dialog = await openEditDialog();

    await within(dialog).findByText(STRIPE_LOAD_ERROR);
});

test('keeps the dialog open with the server error when saving fails', async () => {
    server.use(
        billingGraphql.mutation('SetBillingContact', () =>
            HttpResponse.json({
                errors: [{ message: 'Address could not be verified' }],
            })
        )
    );
    const dialog = await openEditDialog();
    stripe.getValue.mockResolvedValue(austin);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await within(dialog).findByText("Couldn't save billing contact");
    expect(
        within(dialog).getByText('Address could not be verified')
    ).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeTruthy();
});
