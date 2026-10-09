import type { ReactNode } from 'react';
import type { CapabilityBit } from 'src/gql-types/graphql';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';

import AdminBilling from 'src/components/admin/Billing';
import ContentProvider from 'src/context/Content';
import UrqlConfigProvider from 'src/context/URQL';
import { useEntitiesStore } from 'src/stores/Entities/Store';
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
        billingGraphql.mutation('CreateBillingSetupIntent', () => setupIntent())
    );
});

test('offers tenants by their own ViewBilling bit, not legacy admin', async () => {
    grant({
        'acme/': ['ViewBilling'],
        'beta/team/': ['ViewBilling', 'EditBilling'],
        'gamma/': ['CatalogRead', 'SpecEdit'],
    });
    // Selected on another page, where the user's legacy admin grant offers it.
    useEntitiesStore.setState({
        capabilities: {
            admin: new Set(['gamma/']),
            read: new Set(),
            write: new Set(),
        },
    });
    useTenantStore.setState({ selectedTenant: 'gamma/' });
    render(<AdminBilling />, { wrapper });

    await screen.findByText('Acme card');
    const tenantSelector = screen.getByRole('combobox');
    expect((tenantSelector as HTMLInputElement).value).toBe('acme/');
    fireEvent.mouseDown(tenantSelector);
    expect(
        screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['acme/']);
    expect(new Set(billingReads)).toEqual(new Set(['acme/']));
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
        state: 'no tenant-level ViewBilling',
        body: {
            data: capabilities({
                'acme/': ['EditBilling'],
                'acme/team/': ['ViewBilling', 'EditBilling'],
            }),
        },
        message: "You don't have permission to view billing for any tenant.",
    },
])('reads no billing data with $state', async ({ body, message }) => {
    server.use(
        billingGraphql.query('BillingCapabilities', () =>
            HttpResponse.json(body)
        )
    );
    render(<AdminBilling />, { wrapper });

    await screen.findByText(message);
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(billingReads).toEqual([]);
});
