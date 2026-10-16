import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import UrqlConfigProvider from 'src/context/URQL';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import { useTenantStore } from 'src/stores/Tenant';
import { billingGraphql, dropFetchSignals } from 'src/test/billing';
import { HttpResponse, server } from 'src/test/server/test-server';

beforeEach(() => {
    dropFetchSignals();
    useTenantStore.setState({ selectedTenant: 'acme/' });
});

afterEach(() => vi.useRealTimers());

// Six whole months through the current one. The filter's dates are exclusive.
test.each([
    ['2026-10-15', '2026-04-30', '2026-11-01'],
    ['2026-11-01', '2026-05-31', '2026-12-01'],
])('on %s, reads invoices after %s and before %s', async (today, gt, lt) => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(`${today}T12:00`) });
    const filters: unknown[] = [];
    server.use(
        billingGraphql.query('TenantBillingInvoices', ({ variables }) => {
            filters.push(variables.filter);
            return HttpResponse.json({ data: { tenant: null } });
        })
    );
    renderHook(() => useBillingInvoices({ months: 6 }), {
        wrapper: UrqlConfigProvider,
    });

    await waitFor(() =>
        expect(filters).toEqual([{ dateStart: { gt }, dateEnd: { lt } }])
    );
});
