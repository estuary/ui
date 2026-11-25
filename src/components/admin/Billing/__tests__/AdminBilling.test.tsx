import type { ReactNode } from 'react';
import type { CapabilityBundle } from 'src/gql-types/graphql';

import {
    act,
    configure,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import AdminBilling from 'src/components/admin/Billing';
import ContentProvider from 'src/context/Content';
import { UrqlConfigProvider } from 'src/context/URQL';
import { useTenantStore } from 'src/stores/Tenant';
import {
    billingGraphql,
    completeContact,
    contactData,
    internalPlan,
    invoice,
    invoicesData,
    monthToDateData,
    paymentMethodsData,
    planData,
    setupIntent,
} from 'src/test/billing';
import { handleSpendAlert } from 'src/test/billingAlert';
import { HttpResponse, server } from 'src/test/server/test-server';
import { dropFetchSignals } from 'src/test/shared';

// ECharts draws nothing in jsdom.
vi.mock('src/components/admin/Billing/overview/ThisMonthChart', () => ({
    ThisMonthChart: () => null,
}));
vi.mock(
    'src/components/admin/Billing/overview/SpendAlert/SpendAlertCard',
    () => ({
        SpendAlertCard: ({
            tenant,
            canEdit,
            chargesCents,
        }: {
            tenant: string;
            canEdit: boolean;
            chargesCents: number | null;
        }) => (
            <div>
                {`Spend alert for ${tenant} at ${chargesCents}, ${
                    canEdit ? 'editable' : 'read-only'
                }`}
            </div>
        ),
    })
);
vi.mock('src/components/admin/Billing/usage/UsageTab', () => ({
    UsageTab: ({ tenant }: { tenant: string }) => (
        <div>{`Usage for ${tenant}`}</div>
    ),
}));
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: () => Promise.resolve(null),
}));

// The page runs several queries before its cards show, which can take longer
// than the default wait on a busy machine.
configure({ asyncUtilTimeout: 3000 });

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <ContentProvider>
            <UrqlConfigProvider>{children}</UrqlConfigProvider>
        </ContentProvider>
    </MemoryRouter>
);

const card = (name: string) => screen.findByRole('region', { name });

// Each GraphQL operation the page sent, with its tenant.
let operations: string[];
server.events.on('request:start', ({ request }) => {
    void request
        .clone()
        .json()
        .then(({ operationName, variables }) =>
            operations.push(`${operationName} ${variables.tenant}`)
        );
});
const billingReads = () =>
    operations.filter((name) => !name.startsWith('BillingCapabilities '));

// The server returns the row at the requested tenant, if a grant lands there.
const capabilities = (bundles?: CapabilityBundle[]) => ({
    prefixes: {
        __typename: 'PrefixRefConnection',
        edges: bundles
            ? [
                  {
                      __typename: 'PrefixRefEdge',
                      node: { __typename: 'PrefixRef', capabilities: bundles },
                  },
              ]
            : [],
    },
});

const grant = (grants: Record<string, CapabilityBundle[]>) =>
    server.use(
        billingGraphql.query('BillingCapabilities', ({ variables }) =>
            HttpResponse.json({ data: capabilities(grants[variables.tenant]) })
        )
    );

const preview = invoice('11', {
    invoiceType: 'PREVIEW',
    dateEnd: '2026-11-30',
    subtotal: 56660,
    status: null,
});

// Serves the preview to the This month card and a page per cursor to the
// invoices card.
const serveInvoices = (
    pages: Record<string, ReturnType<typeof invoicesData>>
) =>
    server.use(
        billingGraphql.query('TenantBillingInvoices', ({ variables }) =>
            HttpResponse.json({
                data:
                    variables.filter?.invoiceType?.eq === 'PREVIEW'
                        ? invoicesData([preview])
                        : pages[variables.after ?? 'first'],
            })
        )
    );

// `billing` is non-null, so an error in one of its fields nulls the tenant.
const failure = (field: string) => ({
    data: { tenant: null },
    errors: [
        { message: 'Stripe unavailable', path: ['tenant', 'billing', field] },
    ],
});

beforeEach(() => {
    dropFetchSignals();
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-11-09T12:00Z') });
    operations = [];
    useTenantStore.setState({ selectedTenant: 'acme/' });
    serveInvoices({
        first: invoicesData([preview, invoice('10'), invoice('09')]),
    });
    server.use(
        billingGraphql.query('BillingCapabilities', () =>
            HttpResponse.json({
                data: capabilities(['ViewBilling', 'EditBilling']),
            })
        ),
        billingGraphql.query('TenantBillingPlan', () =>
            HttpResponse.json({ data: planData() })
        ),
        billingGraphql.query('TenantBillingMonthToDate', () =>
            HttpResponse.json({ data: monthToDateData() })
        ),
        billingGraphql.query('TenantBillingContact', () =>
            HttpResponse.json({ data: contactData(completeContact) })
        ),
        billingGraphql.query('TenantBillingPaymentMethods', () =>
            HttpResponse.json({ data: paymentMethodsData() })
        ),
        billingGraphql.mutation('CreateBillingSetupIntent', () => setupIntent())
    );
    handleSpendAlert({});
});

afterEach(() => vi.useRealTimers());

test('shows each card from its own read', async () => {
    render(<AdminBilling />, { wrapper });

    await within(await card('Plan')).findByText(
        'Your next invoice is about $2,017 on Dec 1, charged to Visa ending 0042.'
    );
    const thisMonth = await card('This month');
    expect(within(thisMonth).getByText('Due for November')).toBeTruthy();
    expect(
        within(thisMonth).getByText('Nov 1 – 9 · billed Dec 1')
    ).toBeTruthy();
    expect(within(thisMonth).getByText('$566.60')).toBeTruthy();
    expect(within(thisMonth).getByText('2,960 GB at $0.50/GB')).toBeTruthy();
    expect(within(thisMonth).getByText('Billing credits')).toBeTruthy();
    expect(
        screen.getByText('Spend alert for acme/ at 68200, read-only')
    ).toBeTruthy();

    const invoices = await card('Invoices');
    expect(within(invoices).getByText('In progress')).toBeTruthy();
    expect(within(invoices).getByText('October 2026')).toBeTruthy();
    expect(within(invoices).getAllByText('Paid')).toHaveLength(2);

    const payment = await card('Payment');
    await within(payment).findByText('•••• 0042');
    expect(within(payment).getByText('Expires 12/30')).toBeTruthy();
    expect(within(payment).getByText('Acme Corp')).toBeTruthy();
});

test('lets admins edit the spend alert', async () => {
    grant({ 'acme/': ['ViewBilling', 'EditBilling', 'Admin'] });
    render(<AdminBilling />, { wrapper });

    await screen.findByText('Spend alert for acme/ at 68200, editable');
});

test.each([
    {
        operation: 'TenantBillingPaymentMethods',
        field: 'paymentMethods',
        message: /error loading your payment methods/,
    },
    {
        operation: 'TenantBillingContact',
        field: 'contact',
        message: /error loading your billing contact/,
    },
    {
        operation: 'TenantBillingPlan',
        field: 'plan',
        message: /error loading your plan/,
    },
])(
    'keeps the other cards when $operation fails',
    async ({ operation, field, message }) => {
        server.use(
            billingGraphql.query(operation, () =>
                HttpResponse.json(failure(field))
            )
        );
        render(<AdminBilling />, { wrapper });

        await screen.findByText(message);
        await within(await card('Invoices')).findByText('October 2026');
        // Each failure leaves at least one of the payment card's rows.
        await waitFor(() =>
            expect(
                screen.queryByText('Acme Corp') ??
                    screen.queryByText('\u2022\u2022\u2022\u2022 0042')
            ).toBeTruthy()
        );
    }
);

test("leaves the projection out when this month's usage can't be read", async () => {
    server.use(
        billingGraphql.query('TenantBillingMonthToDate', () =>
            HttpResponse.json(failure('monthToDate'))
        )
    );
    render(<AdminBilling />, { wrapper });

    await screen.findByText(
        'Your next invoice is on Dec 1, charged to Visa ending 0042.'
    );
    expect(
        screen.getByText('Spend alert for acme/ at null, read-only')
    ).toBeTruthy();
});

test('pages through the invoices', async () => {
    const cursors: unknown[] = [];
    server.use(
        billingGraphql.query('TenantBillingInvoices', ({ variables }) => {
            if (variables.filter?.invoiceType?.eq === 'PREVIEW') {
                return HttpResponse.json({ data: invoicesData([preview]) });
            }
            cursors.push(variables.after);
            return HttpResponse.json({
                data: variables.after
                    ? invoicesData([invoice('05')])
                    : invoicesData(
                          [
                              preview,
                              invoice('10'),
                              invoice('09'),
                              invoice('08'),
                              invoice('07'),
                          ],
                          'cursor-07'
                      ),
            });
        })
    );
    render(<AdminBilling />, { wrapper });

    const invoices = await screen.findByRole('region', { name: 'Invoices' });
    await within(invoices).findByText('1–5');
    expect(
        within(invoices)
            .getByRole('button', { name: 'Newer invoices' })
            .hasAttribute('disabled')
    ).toBe(true);

    fireEvent.click(
        within(invoices).getByRole('button', { name: 'Older invoices' })
    );
    await within(invoices).findByText('May 2026');
    expect(within(invoices).getByText('6–6')).toBeTruthy();
    expect(cursors).toEqual([undefined, 'cursor-07']);
    expect(
        within(invoices)
            .getByRole('button', { name: 'Older invoices' })
            .hasAttribute('disabled')
    ).toBe(true);

    fireEvent.click(
        within(invoices).getByRole('button', { name: 'Newer invoices' })
    );
    await within(invoices).findByText('July 2026');
});

test('opens an invoice to its lines and links', async () => {
    serveInvoices({
        first: invoicesData([
            preview,
            invoice('10', {
                invoicePdf: 'https://pdf/10',
                hostedInvoiceUrl: 'https://pay/10',
            }),
        ]),
    });
    render(<AdminBilling />, { wrapper });

    const invoices = await screen.findByRole('region', { name: 'Invoices' });
    const row = await within(invoices).findByRole('button', {
        name: /October 2026/,
    });
    fireEvent.click(row);

    expect(row.getAttribute('aria-expanded')).toBe('true');
    expect(within(invoices).getByText('2,960 GB × $0.50/GB')).toBeTruthy();
    expect(
        within(invoices).getByText('Credit: Task hours during the 10 outage')
    ).toBeTruthy();
    expect(
        within(invoices).getByText(
            'Issued Nov 1, 2026 · 2,960 GB · 6,920 task hours · −$70.00 credits'
        )
    ).toBeTruthy();
    expect(
        within(invoices)
            .getByRole('link', { name: 'View invoice' })
            .getAttribute('href')
    ).toBe('https://pay/10');
    expect(
        within(invoices)
            .getByRole('link', { name: 'Download PDF' })
            .getAttribute('href')
    ).toBe('https://pdf/10');
});

test('starts each tenant at its newest invoices, including on return', async () => {
    serveInvoices({
        'first': invoicesData([invoice('09')], 'cursor-09'),
        'cursor-09': invoicesData([invoice('05')]),
    });
    const select = (selectedTenant: string) =>
        act(() => useTenantStore.setState({ selectedTenant }));
    const nextPage = async () => {
        const invoices = await screen.findByRole('region', {
            name: 'Invoices',
        });
        await within(invoices).findByText('September 2026');
        fireEvent.click(
            within(invoices).getByRole('button', { name: 'Older invoices' })
        );
        await within(invoices).findByText('May 2026');
    };
    render(<AdminBilling />, { wrapper });
    await nextPage();
    select('other/');
    await nextPage();

    // acme/'s reads are cached, so only the remount resets its page.
    select('acme/');
    const invoices = await screen.findByRole('region', { name: 'Invoices' });
    await within(invoices).findByText('September 2026');
    expect(
        within(invoices)
            .getByRole('button', { name: 'Newer invoices' })
            .hasAttribute('disabled')
    ).toBe(true);
});

test('shows no spend alert or payment for an internal tenant', async () => {
    server.use(
        billingGraphql.query('TenantBillingPlan', () =>
            HttpResponse.json({ data: planData(internalPlan) })
        )
    );
    render(<AdminBilling />, { wrapper });

    await within(await card('This month')).findByText(
        'Data processed in November'
    );
    expect(
        within(await card('Invoices')).getAllByText('Not billed')
    ).toHaveLength(2);
    expect(screen.queryByText(/Spend alert for/)).toBeNull();
    expect(screen.queryByRole('region', { name: 'Payment' })).toBeNull();
    expect(billingReads()).not.toContain('TenantBillingPaymentMethods acme/');
});

test('switches to the usage tab and back', async () => {
    render(<AdminBilling />, { wrapper });

    fireEvent.click(
        await screen.findByRole('button', { name: 'Usage by task' })
    );
    await screen.findByText('Usage for acme/');
    expect(screen.queryByRole('region', { name: 'Plan' })).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    await screen.findByRole('region', { name: 'Plan' });
});

test('reads no billing data until access loads', async () => {
    let requested = false;
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
        release = resolve;
    });
    server.use(
        billingGraphql.query('BillingCapabilities', async () => {
            requested = true;
            await pending;
            return HttpResponse.json({
                data: capabilities(['ViewBilling']),
            });
        })
    );
    render(<AdminBilling />, { wrapper });

    expect(screen.queryByRole('region', { name: 'Plan' })).toBeNull();
    await waitFor(() => expect(requested).toBe(true));
    expect(billingReads()).toEqual([]);

    release();
    await screen.findByText('Acme Corp');
});

test.each([
    {
        state: 'a permission error',
        body: { errors: [{ message: 'Capabilities unavailable' }] },
        message:
            'There was an error loading your billing permissions. Please try again later.',
    },
    {
        state: 'EditBilling but not ViewBilling',
        body: { data: capabilities(['EditBilling']) },
        message: "You don't have permission to view billing for acme/.",
    },
])('reads no billing data with $state', async ({ body, message }) => {
    server.use(
        billingGraphql.query('BillingCapabilities', () =>
            HttpResponse.json(body)
        )
    );
    render(<AdminBilling />, { wrapper });

    await screen.findByText(message);
    expect(billingReads()).toEqual([]);
});

test('hides edit actions on switching to a view-only tenant', async () => {
    grant({
        'acme/': ['ViewBilling', 'EditBilling'],
        'viewer/': ['ViewBilling'],
    });
    render(<AdminBilling showAddPayment />, { wrapper });

    // Editors get the add-payment form from the route, and every action.
    await screen.findByRole('heading', { name: 'Payment methods' });
    await screen.findByText('Acme card');
    const actions = ['Change', 'Edit', 'Add Payment Method', 'Delete'];
    actions.forEach((name) =>
        expect(screen.getByRole('button', { name })).toBeTruthy()
    );

    // Viewers on the same route get no actions, setup or form.
    act(() => useTenantStore.setState({ selectedTenant: 'viewer/' }));

    await within(
        await screen.findByRole('region', { name: 'Payment' })
    ).findByText('•••• 0042');
    actions.forEach((name) =>
        expect(screen.queryByRole('button', { name })).toBeNull()
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(operations).not.toContain('CreateBillingSetupIntent viewer/');
});
