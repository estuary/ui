import type { ReactNode } from 'react';

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test } from 'vitest';

import { UrqlConfigProvider } from 'src/context/URQL';
import { useBillingPaymentMethods } from 'src/hooks/billing/useBillingPaymentMethods';
import { useBillingPlan } from 'src/hooks/billing/useBillingPlan';
import { billingGraphql, planData } from 'src/test/billing';
import { delay, HttpResponse, server } from 'src/test/server/test-server';
import { dropFetchSignals } from 'src/test/shared';

const wrapper = ({ children }: { children: ReactNode }) => (
    <UrqlConfigProvider>{children}</UrqlConfigProvider>
);

beforeEach(() => dropFetchSignals());

// `billing` and its fields are non-null, so the server answers a failed field
// with `tenant: null`, which the cache writes over the tenant the plan read.
test.each([
    ['before', 0],
    ['after', 50],
])(
    'a failed read fails only its own query, with the plan answering %s it',
    async (_order, planDelayMs) => {
        server.use(
            billingGraphql.query('TenantBillingPlan', async () => {
                await delay(planDelayMs);
                return HttpResponse.json({ data: planData() });
            }),
            billingGraphql.query('TenantBillingPaymentMethods', async () => {
                await delay(25);
                return HttpResponse.json({
                    data: { tenant: null },
                    errors: [
                        {
                            message: 'Stripe unavailable',
                            path: ['tenant', 'billing', 'paymentMethods'],
                        },
                    ],
                });
            })
        );

        const { result } = renderHook(
            () => ({
                plan: useBillingPlan('acme/'),
                payment: useBillingPaymentMethods('acme/'),
            }),
            { wrapper }
        );

        await waitFor(() =>
            expect(result.current.payment.error?.message).toContain(
                'Stripe unavailable'
            )
        );
        await waitFor(() =>
            expect(result.current.plan.plan?.__typename).toBe('SelfServePlan')
        );
        expect(result.current.plan.error).toBeUndefined();
        expect(result.current.payment.billing).toBeUndefined();
    }
);
