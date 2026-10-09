import type { ReactNode } from 'react';

import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { IntlProvider } from 'react-intl';
import { beforeEach, expect, test, vi } from 'vitest';

import { BillingContactSection } from 'src/components/admin/Billing/BillingContactSection';
import UrqlConfigProvider from 'src/context/URQL';
import {
    austin,
    billing,
    billingGraphql,
    completeContact,
    contactData,
    dropFetchSignals,
    emptyContact,
    handleContactSaves,
    incompleteContact,
    paymentMethodsData,
} from 'src/test/billing';
import { HttpResponse, server } from 'src/test/server/test-server';

const stripe = vi.hoisted(() => ({ getValue: vi.fn() }));
vi.mock('src/stores/Tenant', () => ({
    useTenantStore: (
        selector: (state: { selectedTenant: string }) => unknown
    ) => selector({ selectedTenant: 'acme/' }),
}));
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: () => Promise.resolve(null),
}));
vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }: { children: ReactNode }) => children,
    AddressElement: () => null,
    useElements: () => ({
        getElement: () => ({ getValue: stripe.getValue }),
    }),
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
    server.use(
        billingGraphql.query('TenantBillingContact', ({ variables }) => {
            contactReads++;
            return HttpResponse.json({
                data: contactData(variables.tenant, contact),
            });
        }),
        billingGraphql.query('TenantBillingPaymentMethods', ({ variables }) =>
            HttpResponse.json({
                data: paymentMethodsData(variables.tenant, billing([])),
            })
        )
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
            email: 'ap@newco.com',
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
    expect(screen.getByText('Saved')).toBeTruthy();
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
    expect(saves.map((saved) => saved.email)).toEqual(['ap@acme.co']);
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
    expect(screen.queryByText('Saved')).toBeNull();
});

test('shows a lock instead of edit actions without EditBilling', async () => {
    render(<BillingContactSection canEdit={false} />, { wrapper });

    await screen.findByLabelText(
        "You don't have permission to edit billing for acme/"
    );
    expect(screen.getByText('Acme Corp')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
});

test('leaves load errors to the page error boundary', async () => {
    server.use(
        billingGraphql.query('TenantBillingContact', () =>
            HttpResponse.json({ errors: [{ message: 'Contact unavailable' }] })
        )
    );
    render(
        <ErrorBoundary fallback={<p>Billing failed to load</p>}>
            <BillingContactSection canEdit />
        </ErrorBoundary>,
        { wrapper }
    );

    await screen.findByText('Billing failed to load');
});
