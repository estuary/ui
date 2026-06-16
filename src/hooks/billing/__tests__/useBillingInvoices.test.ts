import type { TenantBillingInvoicesQuery } from 'src/gql-types/graphql';
import type * as Urql from 'urql';

import { act, renderHook, waitFor } from '@testing-library/react';
import { format } from 'date-fns';
import { CombinedError, createRequest, makeOperation, useQuery } from 'urql';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import { useBillingStore } from 'src/stores/Billing';
import { invoiceId } from 'src/utils/billing-utils';

const tenant = vi.hoisted(() => ({ selectedTenant: 'acme/' }));

vi.mock('src/stores/Tenant', () => ({
    useTenantStore: (selector: (state: typeof tenant) => unknown) =>
        selector(tenant),
}));
vi.mock('urql', async (importOriginal) => ({
    ...(await importOriginal<typeof Urql>()),
    useQuery: vi.fn(),
}));

type InvoiceNode = NonNullable<
    TenantBillingInvoicesQuery['tenant']
>['billing']['invoices']['edges'][number]['node'];

const makeNode = (overrides: Partial<InvoiceNode> = {}): InvoiceNode => ({
    dateStart: '2026-10-01',
    dateEnd: '2026-10-31',
    invoiceType: 'FINAL',
    subtotal: 100,
    lineItems: [
        { description: 'Task Usage', count: 1, rate: 100, subtotal: 100 },
    ],
    extra: { task_usage_hours: 1, processed_data_gb: 2 },
    ...overrides,
});

const makePage = (
    name: string,
    nodes: InvoiceNode[],
    endCursor?: string
): TenantBillingInvoicesQuery => ({
    tenant: {
        name,
        billing: {
            invoices: {
                edges: nodes.map((node) => ({ node })),
                pageInfo: {
                    hasNextPage: Boolean(endCursor),
                    endCursor: endCursor ?? null,
                },
            },
        },
    },
});

const mockedUseQuery = vi.mocked(useQuery);

const makeResult = (
    args: Urql.UseQueryArgs,
    data?: TenantBillingInvoicesQuery,
    error?: CombinedError,
    fetching = false
): ReturnType<typeof useQuery> => [
    {
        fetching,
        stale: false,
        hasNext: false,
        data,
        error,
        operation: makeOperation(
            'query',
            createRequest(args.query, args.variables),
            { url: '/graphql', requestPolicy: 'cache-first' }
        ),
    },
    vi.fn(),
];

describe('useBillingInvoices', () => {
    beforeEach(() => {
        tenant.selectedTenant = 'acme/';
        mockedUseQuery.mockReset();
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date(2026, 9, 8));
    });

    afterEach(() => vi.useRealTimers());

    test('retains a manual invoice beyond the first 100 rows and the current preview', async () => {
        const firstPage = makePage(
            'acme/',
            Array.from({ length: 100 }, (_, i) =>
                makeNode({
                    dateStart: format(new Date(2026, 9 - i, 1), 'yyyy-MM-dd'),
                    dateEnd: format(new Date(2026, 10 - i, 0), 'yyyy-MM-dd'),
                    invoiceType: i === 0 ? 'PREVIEW' : 'FINAL',
                })
            ),
            'older'
        );
        const secondPage = makePage('acme/', [
            makeNode({
                dateStart: '2017-01-01',
                dateEnd: '2017-01-31',
                invoiceType: 'MANUAL',
                extra: null,
            }),
            makeNode({ dateStart: '2017-02-01', dateEnd: '2017-02-28' }),
        ]);
        const cursors: unknown[] = [];
        mockedUseQuery.mockImplementation((args) => {
            expect(args.variables?.first).toBe(100);
            cursors.push(args.variables?.after);
            return makeResult(
                args,
                args.variables?.after ? secondPage : firstPage
            );
        });

        const { result } = renderHook(() => useBillingInvoices());
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(cursors).toContain('older');
        expect(result.current.invoices).toHaveLength(7);
        expect(result.current.selectedInvoice?.invoice_type).toBe('preview');
        expect(result.current.invoices.at(-1)).toMatchObject({
            invoice_type: 'manual',
            date_start: '2017-01-01',
        });
        expect(
            result.current.invoices.some(
                (invoice) => invoice.date_start === '2017-02-01'
            )
        ).toBe(false);
        expect(result.current.selectedInvoice?.line_items[0].description).toBe(
            'Task Usage'
        );
    });

    test('selects a manual invoice independently of a final invoice for the same period', async () => {
        const page = makePage('acme/', [
            makeNode(),
            makeNode({ invoiceType: 'MANUAL' }),
        ]);
        mockedUseQuery.mockImplementation((args) => makeResult(args, page));
        const { result } = renderHook(() => useBillingInvoices());
        await waitFor(() => expect(result.current.invoices).toHaveLength(2));
        const manual = result.current.invoices.find(
            (invoice) => invoice.invoice_type === 'manual'
        )!;
        act(() =>
            useBillingStore.getState().setSelectedInvoice(invoiceId(manual))
        );
        expect(result.current.selectedInvoice?.invoice_type).toBe('manual');
    });

    test('reports a later-page failure instead of returning a truncated successful result', async () => {
        const page = makePage('acme/', [makeNode()], 'older');
        const error = new CombinedError({ networkError: new Error('offline') });
        mockedUseQuery.mockImplementation((args) =>
            makeResult(
                args,
                args.variables?.after ? undefined : page,
                args.variables?.after ? error : undefined
            )
        );
        const { result } = renderHook(() => useBillingInvoices());
        await waitFor(() => expect(result.current.errorExists).toBe(true));
        expect(result.current.networkFailed).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.invoices).toEqual([]);
    });
});
