import type { ReactNode } from 'react';

import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from 'react-error-boundary';
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

test.each([false, true])(
    'keeps an unreadable tenant unavailable on remount (query error: %s)',
    async (withQueryError) => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        server.use(
            billingGraphql.query('TenantBillingContact', () => {
                contactReads++;
                return HttpResponse.json({
                    data: { tenant: null },
                    ...(withQueryError && {
                        errors: [{ message: 'Stripe unavailable' }],
                    }),
                });
            })
        );
        const section = (key: string) => (
            <ErrorBoundary
                key={key}
                fallbackRender={({ error }) => <div>{error.message}</div>}
            >
                <BillingContactSection canEdit />
            </ErrorBoundary>
        );
        const { rerender } = render(section('first'), { wrapper });

        const message = withQueryError
            ? /Stripe unavailable/
            : 'Unable to load billing for acme/';
        await screen.findByText(message);
        rerender(section('return'));

        await screen.findByText(message);
        expect(
            screen.queryByRole('button', { name: 'Add billing contact' })
        ).toBeNull();
        // The provider treats a null tenant as uncached and retries on return.
        expect(contactReads).toBe(2);
    }
);

test('saves edits and shows them from the cache', async () => {
    const saves = handleContactSaves();
    const dialog = await openEditDialog();

    stripe.getValue.mockResolvedValue({
        ...austin,
        value: { ...austin.value, name: ' New Co ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saves).toEqual([
        {
            tenant: 'acme/',
            name: 'New Co',
            emails: completeContact.emails,
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

test('replaces the primary billing email', async () => {
    const saves = handleContactSaves();
    const dialog = await openEditDialog();
    stripe.getValue.mockResolvedValue(austin);

    fireEvent.click(
        within(dialog).getByRole('button', {
            name: `Remove ${completeContact.emails[0]}`,
        })
    );
    await waitFor(() =>
        expect(
            within(dialog).queryByRole('button', {
                name: `Remove ${completeContact.emails[0]}`,
            })
        ).toBeNull()
    );
    fireEvent.change(within(dialog).getByLabelText(/^Billing emails/), {
        target: { value: ' ap@newco.com ' },
    });
    fireEvent.blur(within(dialog).getByLabelText(/^Billing emails/));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saves.map((saved) => saved.emails)).toEqual([['ap@newco.com']]);
});

test('saves only once the address is complete', async () => {
    const saves = handleContactSaves();
    const dialog = await openEditDialog();
    const save = within(dialog).getByRole('button', { name: 'Save' });

    stripe.getValue.mockResolvedValue({ ...austin, complete: false });
    fireEvent.click(save);
    await waitFor(() => expect(stripe.getValue).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(save.hasAttribute('disabled')).toBe(false));
    expect(saves).toEqual([]);

    stripe.getValue.mockResolvedValue(austin);
    fireEvent.click(save);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saves.map((saved) => saved.emails)).toEqual([completeContact.emails]);
});

test('saves additional emails after the billing email', async () => {
    contact = { ...completeContact, emails: ['billing@acme.co', 'ap@acme.co'] };
    const saves = handleContactSaves();
    const dialog = await openEditDialog();
    const save = within(dialog).getByRole('button', { name: 'Save' });
    const additional = within(dialog).getByPlaceholderText(
        'Add additional emails...'
    );
    stripe.getValue.mockResolvedValue(austin);

    fireEvent.change(additional, { target: { value: 'pay@acme.co, oops' } });
    fireEvent.keyDown(additional, { key: 'Enter' });
    await within(dialog).findByText('Enter valid emails, like ap@company.com');
    expect(
        await within(dialog).findByRole('button', {
            name: 'Remove pay@acme.co',
        })
    ).toBeTruthy();
    fireEvent.click(save);
    await waitFor(() => expect(save.hasAttribute('disabled')).toBe(false));
    expect(saves).toEqual([]);

    // New addresses are added on blur, while duplicates stay in the input to fix.
    fireEvent.change(additional, {
        target: { value: 'AP@acme.co team@acme.co' },
    });
    fireEvent.blur(additional);
    expect(
        within(dialog).getByText('AP@acme.co is already in the list')
    ).toBeTruthy();
    expect((additional as HTMLInputElement).value).toBe('AP@acme.co');
    fireEvent.change(additional, { target: { value: '' } });
    expect(
        within(dialog).queryByText('AP@acme.co is already in the list')
    ).toBeNull();
    fireEvent.click(save);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saves.map((saved) => saved.emails)).toEqual([
        ['billing@acme.co', 'ap@acme.co', 'pay@acme.co', 'team@acme.co'],
    ]);
    // The section shows only the billing email.
    expect(screen.getByText('billing@acme.co')).toBeTruthy();
    expect(screen.queryByText('ap@acme.co')).toBeNull();
});

test('cannot save without any emails', async () => {
    contact = { ...completeContact, emails: [] };
    const saves = handleContactSaves();
    render(<BillingContactSection canEdit />, { wrapper });
    await userEvent.click(
        await screen.findByRole('button', { name: 'Finish' })
    );
    const dialog = await screen.findByRole('dialog');
    stripe.getValue.mockResolvedValue(austin);

    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await within(dialog).findByText('Enter a billing email');
    expect(saves).toEqual([]);
    expect(screen.getByRole('dialog')).toBe(dialog);
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
