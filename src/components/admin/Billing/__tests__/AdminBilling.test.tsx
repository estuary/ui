import type { ReactNode } from 'react';
import type { CapabilityBit } from 'src/gql-types/graphql';

import { act, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';

import AdminBilling from 'src/components/admin/Billing';
import ContentProvider from 'src/context/Content';
import UrqlConfigProvider from 'src/context/URQL';
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
vi.mock('src/context/fetcher/TenantBillingDetails', () => ({
    useTenantUsesExternalPayment: () => [false, null],
}));
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: () => Promise.resolve(null),
}));

// The tenants whose invoices or payment methods were read.
let billingReads: string[];
let setupIntents: string[];

const lock = (tenant: string) =>
    `You don't have permission to edit billing for ${tenant}`;

const capabilities = (grants: Record<string, CapabilityBit[]>) => ({
    prefixes: {
        __typename: 'PrefixRefConnection',
        edges: Object.entries(grants).map(([prefix, bits]) => ({
            __typename: 'PrefixRefEdge',
            node: { __typename: 'PrefixRef', prefix, capabilities: bits },
        })),
        pageInfo: {
            __typename: 'PageInfo',
            hasNextPage: false,
            endCursor: null,
        },
    },
});

const grant = (grants: Record<string, CapabilityBit[]>) =>
    server.use(
        billingGraphql.query('BillingCapabilities', () =>
            HttpResponse.json({ data: capabilities(grants) })
        )
    );

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <ContentProvider>
            <UrqlConfigProvider>{children}</UrqlConfigProvider>
        </ContentProvider>
    </MemoryRouter>
);

beforeEach(() => {
    dropFetchSignals();
    billingReads = [];
    setupIntents = [];
    useTenantStore.setState({ selectedTenant: 'acme/' });
    server.use(
        billingGraphql.query('TenantBillingInvoices', ({ variables }) => {
            billingReads.push(variables.tenant);
            return HttpResponse.json({
                data: {
                    tenant: {
                        __typename: 'Tenant',
                        name: variables.tenant,
                        billing: {
                            __typename: 'TenantBilling',
                            invoices: {
                                __typename: 'InvoiceConnection',
                                edges: [],
                                pageInfo: {
                                    __typename: 'PageInfo',
                                    hasNextPage: false,
                                    endCursor: null,
                                },
                            },
                        },
                    },
                },
            });
        }),
        billingGraphql.query('TenantBillingPaymentMethods', ({ variables }) => {
            billingReads.push(variables.tenant);
            return HttpResponse.json({
                data: paymentMethodsData(variables.tenant),
            });
        }),
        billingGraphql.mutation('CreateBillingSetupIntent', ({ variables }) => {
            setupIntents.push(variables.tenant);
            return setupIntent();
        })
    );
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
                data: capabilities({ 'acme/': ['ViewBilling'] }),
            });
        })
    );
    render(<AdminBilling />, { wrapper });

    const loading = { name: 'Loading billing access' };
    expect(screen.getByRole('progressbar', loading)).toBeTruthy();
    expect(screen.queryByText('Payment Information')).toBeNull();
    await waitFor(() => expect(requested).toBe(true));
    expect(billingReads).toEqual([]);

    release();
    await screen.findByText('Acme card');
    expect(screen.queryByRole('progressbar', loading)).toBeNull();
});

test.each([
    {
        state: 'a permission error',
        body: { errors: [{ message: 'Capabilities unavailable' }] },
        message:
            'There was an error loading your billing permissions. Please try again later.',
    },
    {
        state: 'no ViewBilling on the tenant itself',
        body: {
            data: capabilities({
                'acme/team/': ['ViewBilling', 'EditBilling'],
                'acme/': ['EditBilling'],
            }),
        },
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
    expect(billingReads).toEqual([]);
});

test('lets viewers read billing without setup or edit requests', async () => {
    grant({
        // An edit grant below the tenant does not cover the tenant.
        'acme/team/': ['EditBilling'],
        'acme/': ['ViewBilling'],
    });
    // The add-payment route.
    render(<AdminBilling showAddPayment />, { wrapper });

    const row = await screen.findByRole('row', { name: /Acme card/ });
    expect(within(row).getByLabelText(lock('acme/'))).toBeTruthy();
    ['Add Payment Method', 'Delete', 'Make Primary'].forEach((name) =>
        expect(screen.queryByRole('button', { name })).toBeNull()
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(setupIntents).toEqual([]);
});

test('swaps payment actions for locks on switching to a view-only tenant', async () => {
    grant({
        'acme/': ['ViewBilling', 'EditBilling'],
        'viewer/': ['ViewBilling'],
    });
    render(<AdminBilling showAddPayment />, { wrapper });

    // Editors get the add-payment form from the route, and every action.
    await screen.findByRole('dialog');
    await screen.findByText('Acme card');
    ['Add Payment Method', 'Delete', 'Make Primary'].forEach((name) =>
        expect(screen.getByRole('button', { name })).toBeTruthy()
    );

    act(() => useTenantStore.setState({ selectedTenant: 'viewer/' }));

    await screen.findAllByLabelText(lock('viewer/'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    expect(setupIntents).not.toContain('viewer/');
});
