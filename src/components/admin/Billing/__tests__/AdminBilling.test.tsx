import type { ReactNode } from 'react';
import type { CapabilityBit } from 'src/gql-types/graphql';

import {
    act,
    configure,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';

import AdminBilling from 'src/components/admin/Billing';
import ContentProvider from 'src/context/Content';
import { UrqlConfigProvider } from 'src/context/URQL';
import { useTenantStore } from 'src/stores/Tenant';
import {
    billingGraphql,
    dropFetchSignals,
    paymentMethodsData,
    setupIntent,
} from 'src/test/billing';
import { HttpResponse, server } from 'src/test/server/test-server';

vi.mock('src/components/admin/Tabs', () => ({ default: () => null }));
vi.mock('src/components/graphs/UsageByMonthGraph', () => ({
    default: () => null,
}));
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: () => Promise.resolve(null),
}));

// The page runs several queries before the history shows, which can take
// longer than the default wait on a busy machine.
configure({ asyncUtilTimeout: 3000 });

const invoice = (month: string, overrides = {}) => ({
    __typename: 'Invoice' as const,
    dateStart: `2026-${month}-01`,
    dateEnd: `2026-${month}-28`,
    invoiceType: 'FINAL' as const,
    subtotal: 100,
    lineItems: [
        {
            description: `Usage in ${month}`,
            count: 1,
            rate: 100,
            subtotal: 100,
        },
    ],
    extra: { processed_data_gb: 1, task_usage_hours: 1 },
    status: null,
    invoicePdf: null,
    hostedInvoiceUrl: null,
    ...overrides,
});

const invoicesData = (
    nodes: ReturnType<typeof invoice>[] = [],
    endCursor: string | null = null
) => ({
    tenant: {
        __typename: 'Tenant',
        billing: {
            __typename: 'TenantBilling',
            invoices: {
                __typename: 'InvoiceConnection',
                edges: nodes.map((node) => ({
                    __typename: 'InvoiceEdge',
                    node,
                })),
                pageInfo: {
                    __typename: 'PageInfo',
                    hasNextPage: Boolean(endCursor),
                    endCursor,
                },
            },
        },
    },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <ContentProvider>
            <UrqlConfigProvider>{children}</UrqlConfigProvider>
        </ContentProvider>
    </MemoryRouter>
);

const link = (name: string) =>
    screen.getByRole('link', { name }).getAttribute('href');

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
const capabilities = (bits?: CapabilityBit[]) => ({
    prefixes: {
        __typename: 'PrefixRefConnection',
        edges: bits
            ? [
                  {
                      __typename: 'PrefixRefEdge',
                      node: { __typename: 'PrefixRef', capabilities: bits },
                  },
              ]
            : [],
    },
});

const grant = (grants: Record<string, CapabilityBit[]>) =>
    server.use(
        billingGraphql.query('BillingCapabilities', ({ variables }) =>
            HttpResponse.json({ data: capabilities(grants[variables.tenant]) })
        )
    );

beforeEach(() => {
    dropFetchSignals();
    operations = [];
    useTenantStore.setState({ selectedTenant: 'acme/' });
    server.use(
        billingGraphql.query('BillingCapabilities', () =>
            HttpResponse.json({
                data: capabilities(['ViewBilling', 'EditBilling']),
            })
        ),
        billingGraphql.query('TenantBillingInvoices', () =>
            HttpResponse.json({ data: invoicesData() })
        ),
        billingGraphql.query('TenantBillingPaymentMethods', () =>
            HttpResponse.json({ data: paymentMethodsData() })
        ),
        billingGraphql.mutation('CreateBillingSetupIntent', () => setupIntent())
    );
});

test('pages through the invoice history', async () => {
    const cursors: unknown[] = [];
    server.use(
        billingGraphql.query('TenantBillingInvoices', ({ variables }) => {
            // The history pages; the usage graph reads its months at once.
            if (variables.first) {
                cursors.push(variables.after);
            }
            return HttpResponse.json({
                data: variables.after
                    ? invoicesData([
                          invoice('05', {
                              status: 'paid',
                              invoicePdf: 'https://pdf/05',
                          }),
                      ])
                    : invoicesData(
                          [
                              invoice('09', {
                                  status: 'open',
                                  invoicePdf: 'https://pdf/09',
                                  hostedInvoiceUrl: 'https://pay/09',
                              }),
                              invoice('08'),
                              invoice('07'),
                              // Shares its period with the final invoice.
                              invoice('07', {
                                  invoiceType: 'MANUAL',
                                  subtotal: 50000,
                                  lineItems: [
                                      {
                                          description: 'Manual charge',
                                          count: 1,
                                          rate: 50000,
                                          subtotal: 50000,
                                      },
                                  ],
                                  invoicePdf: 'https://pdf/manual',
                              }),
                          ],
                          'cursor-manual'
                      ),
            });
        })
    );
    render(<AdminBilling />, { wrapper });

    // Each page shows its newest bill, with that invoice's Stripe links.
    await screen.findByText('Usage in 09');
    expect(link('Download invoice PDF')).toBe('https://pdf/09');
    expect(link('Pay Invoice')).toBe('https://pay/09');

    fireEvent.click(screen.getByRole('row', { name: /\$500\.00/ }));
    await screen.findByText('Manual charge');
    expect(link('Download invoice PDF')).toBe('https://pdf/manual');

    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    await screen.findByText('Usage in 05');
    expect(cursors).toEqual([undefined, 'cursor-manual']);
    expect(link('Download invoice PDF')).toBe('https://pdf/05');
    expect(screen.getByRole('button', { name: 'Invoice Paid' })).toBeTruthy();
    expect(screen.getByText('5–5 of 5')).toBeTruthy();

    // The selection returns with its page.
    fireEvent.click(
        screen.getByRole('button', { name: 'Go to previous page' })
    );
    await screen.findByText('Manual charge');
});

test('starts each tenant at its newest invoices, including on return', async () => {
    server.use(
        billingGraphql.query('TenantBillingInvoices', ({ variables }) =>
            HttpResponse.json({
                data: variables.after
                    ? invoicesData([invoice('05')])
                    : invoicesData([invoice('09')], 'cursor-09'),
            })
        )
    );
    const select = (selectedTenant: string) =>
        act(() => useTenantStore.setState({ selectedTenant }));
    const nextPage = async () => {
        await screen.findByText('Usage in 09');
        fireEvent.click(
            screen.getByRole('button', { name: 'Go to next page' })
        );
        await screen.findByText('Usage in 05');
    };
    render(<AdminBilling />, { wrapper });
    await nextPage();
    select('other/');
    await nextPage();

    // acme/'s reads are cached, so only the remount resets its page.
    select('acme/');
    await screen.findByText('Usage in 09');
    const previous = screen.getByRole('button', {
        name: 'Go to previous page',
    });
    expect(previous.hasAttribute('disabled')).toBe(true);
});

test.each([
    // The history and the usage graph share this read.
    'TenantBillingInvoices',
    'TenantBillingPaymentMethods',
])('replaces the details with one error when %s fails', async (operation) => {
    server.use(
        billingGraphql.query(operation, () =>
            // `billing` is non-null, so its error nulls the tenant.
            HttpResponse.json({
                data: { tenant: null },
                errors: [
                    {
                        message: 'Stripe unavailable',
                        path: ['tenant', 'billing'],
                    },
                ],
            })
        )
    );
    render(<AdminBilling />, { wrapper });

    await screen.findByText(
        /There was an error loading your billing information/
    );
    expect(screen.queryByText('Recent History')).toBeNull();
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

    expect(screen.queryByText('Payment Information')).toBeNull();
    await waitFor(() => expect(requested).toBe(true));
    expect(billingReads()).toEqual([]);

    release();
    await screen.findByText('Acme card');
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
    await screen.findByRole('dialog');
    await screen.findByText('Acme card');
    const actions = ['Add Payment Method', 'Delete', 'Make Primary'];
    actions.forEach((name) =>
        expect(screen.getByRole('button', { name })).toBeTruthy()
    );

    // Viewers on the same route get no actions, setup or form.
    act(() => useTenantStore.setState({ selectedTenant: 'viewer/' }));

    await screen.findByRole('row', { name: /Acme card/ });
    actions.forEach((name) =>
        expect(screen.queryByRole('button', { name })).toBeNull()
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(operations).not.toContain('CreateBillingSetupIntent viewer/');
});
