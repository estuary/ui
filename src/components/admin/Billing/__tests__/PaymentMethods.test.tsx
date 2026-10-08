import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getSetupIntentSecret, getTenantPaymentMethods } from 'src/api/billing';
import PaymentMethods from 'src/components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'src/components/admin/Billing/PricingTierDetails';
import { useBillingStore } from 'src/stores/Billing';

const tenant = vi.hoisted(() => ({ selectedTenant: 'acme/' }));

vi.mock('src/stores/Tenant', () => ({
    useTenantStore: (selector: (state: typeof tenant) => unknown) =>
        selector(tenant),
}));
vi.mock('src/context/fetcher/TenantBillingDetails', () => ({
    useTenantUsesExternalPayment: () => [false, null],
}));
vi.mock('src/api/billing', () => ({
    getTenantPaymentMethods: vi.fn(),
    getSetupIntentSecret: vi
        .fn()
        .mockResolvedValue({ data: { intent_secret: 'secret' } }),
    deleteTenantPaymentMethod: vi.fn(),
    setTenantPrimaryPaymentMethod: vi.fn(),
}));
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: () => Promise.resolve(null),
}));
vi.mock('src/components/admin/Billing/AddPaymentMethod', () => ({
    default: () => null,
}));
vi.mock('src/components/admin/Billing/PaymentMethodRow', () => ({
    PaymentMethod: () => null,
}));

describe('billing payment status', () => {
    beforeEach(() => {
        tenant.selectedTenant = 'acme/';
        vi.mocked(getTenantPaymentMethods).mockReset();
        vi.mocked(getSetupIntentSecret).mockResolvedValue({
            data: { intent_secret: 'secret' },
            error: null,
        });
    });

    test('hides the prior tier while loading another tenant and ignores its late response', async () => {
        type Response = Awaited<ReturnType<typeof getTenantPaymentMethods>>;
        let resolveFirst!: (response: Response) => void;
        let resolveSecond!: (response: Response) => void;
        vi.mocked(getTenantPaymentMethods)
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveFirst = resolve;
                    })
            )
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveSecond = resolve;
                    })
            );
        useBillingStore
            .getState()
            .setPaymentMethodStatus('acme/', [{ id: 'prior-card' }]);
        const view = () => (
            <>
                <div data-testid="pricing">
                    <PricingTierDetails />
                </div>
                <PaymentMethods />
            </>
        );
        const { rerender } = render(view());
        const pricing = screen.getByTestId('pricing');
        expect(screen.getByText('Cloud tier')).toBeTruthy();
        expect(pricing.querySelector('.MuiSkeleton-root')).toBeNull();

        tenant.selectedTenant = 'other/';
        rerender(view());
        expect(screen.queryByText('Cloud tier')).toBeNull();
        expect(pricing.querySelector('.MuiSkeleton-root')).not.toBeNull();
        await act(async () =>
            resolveSecond({
                data: { payment_methods: [], primary: null },
                error: null,
            })
        );
        await waitFor(() =>
            expect(useBillingStore.getState().paymentMethodStatus).toEqual({
                tenant: 'other/',
                exists: false,
            })
        );
        expect(pricing.querySelector('.MuiSkeleton-root')).toBeNull();

        await act(async () =>
            resolveFirst({
                data: {
                    payment_methods: [{ id: 'old-card' }],
                    primary: 'old-card',
                },
                error: null,
            })
        );
        expect(useBillingStore.getState().paymentMethodStatus).toEqual({
            tenant: 'other/',
            exists: false,
        });
        expect(screen.queryByText('Cloud tier')).toBeNull();
    });
});
