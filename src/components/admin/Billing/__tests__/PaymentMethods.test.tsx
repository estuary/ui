import type { ReactNode } from 'react';

import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import PaymentMethods from 'src/components/admin/Billing/PaymentMethods';
import PricingTierDetails from 'src/components/admin/Billing/PricingTierDetails';
import UrqlConfigProvider from 'src/context/URQL';
import { fireGtmEvent } from 'src/services/gtm';
import {
    billing,
    billingGraphql,
    dropFetchSignals,
    paymentMethod,
    paymentMethodsData,
    setupIntent,
} from 'src/test/billing';
import { HttpResponse, server } from 'src/test/server/test-server';

const tenant = vi.hoisted(() => ({ selectedTenant: 'acme/' }));
const stripe = vi.hoisted(() => ({ confirmSetup: vi.fn(), update: vi.fn() }));
vi.mock('src/stores/Tenant', () => ({
    useTenantStore: (selector: (state: typeof tenant) => unknown) =>
        selector(tenant),
}));
vi.mock('src/context/fetcher/TenantBillingDetails', () => ({
    useTenantUsesExternalPayment: () => [false, null],
}));
vi.mock('@posthog/react', () => ({ usePostHog: () => ({ capture: vi.fn() }) }));
vi.mock('src/services/gtm', () => ({ fireGtmEvent: vi.fn() }));
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: () => Promise.resolve(null),
}));
vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({
        children,
        options,
    }: {
        children: ReactNode;
        options: { clientSecret: string };
    }) => (
        <div data-testid="stripe-form" data-secret={options.clientSecret}>
            {children}
        </div>
    ),
    AddressElement: () => null,
    PaymentElement: () => null,
    useStripe: () => stripe,
    useElements: () => ({
        getElement: () => ({ update: stripe.update, on: vi.fn() }),
    }),
}));

const payload = (value = billing()) => ({
    ...value,
    __typename: 'BillingPaymentMethodPayload' as const,
});
const failure = () =>
    HttpResponse.json<{ errors: { message: string }[] }>({
        errors: [{ message: 'Payment provider unavailable' }],
    });
const view = (showAddPayment = false) => (
    <>
        <div data-testid="pricing">
            <PricingTierDetails />
        </div>
        <PaymentMethods showAddPayment={showAddPayment} />
    </>
);
const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider locale="en">
        <UrqlConfigProvider>{children}</UrqlConfigProvider>
    </IntlProvider>
);

beforeEach(() => {
    dropFetchSignals();
    tenant.selectedTenant = 'acme/';
    stripe.confirmSetup.mockResolvedValue({
        setupIntent: { payment_method: 'pm_saved' },
    });
    server.use(
        billingGraphql.query('TenantBillingPaymentMethods', ({ variables }) =>
            HttpResponse.json({ data: paymentMethodsData(variables.tenant) })
        ),
        billingGraphql.mutation('CreateBillingSetupIntent', () => setupIntent())
    );
});

describe('billing payments', () => {
    test('shares primary/delete results with the table and pricing, and clears retained tenant data', async () => {
        let paymentReads = 0;
        server.use(
            billingGraphql.query(
                'TenantBillingPaymentMethods',
                ({ variables }) => {
                    paymentReads++;
                    return HttpResponse.json({
                        data: paymentMethodsData(variables.tenant),
                    });
                }
            ),
            billingGraphql.mutation('SetBillingPaymentMethod', () =>
                HttpResponse.json({
                    data: {
                        setBillingPaymentMethod: payload(
                            billing([paymentMethod], paymentMethod.id)
                        ),
                    },
                })
            ),
            billingGraphql.mutation('DeleteBillingPaymentMethod', () =>
                HttpResponse.json({
                    data: { deleteBillingPaymentMethod: payload(billing([])) },
                })
            )
        );
        const { rerender } = render(view(), { wrapper });
        await screen.findByText('Acme card');
        expect(screen.getByText('Cloud tier')).toBeTruthy();
        expect(screen.getByText('0042')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Make Primary' }));
        await waitFor(() =>
            expect(
                screen.queryByRole('button', { name: 'Make Primary' })
            ).toBeNull()
        );
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        await screen.findByText('No payment methods available.');
        expect(screen.queryByText('Cloud tier')).toBeNull();
        expect(paymentReads).toBe(1);

        tenant.selectedTenant = 'other/';
        rerender(view());
        expect(screen.queryByText('Acme card')).toBeNull();
        expect(
            screen.getByTestId('pricing').querySelector('.MuiSkeleton-root')
        ).not.toBeNull();
        await screen.findByText('Acme card');
        expect(screen.getByText('Cloud tier')).toBeTruthy();
    });

    test('shows mutation failures and discards a late action after switching tenants', async () => {
        let release!: () => void;
        const pending = new Promise<void>((resolve) => {
            release = resolve;
        });
        let deletes = 0;
        server.use(
            billingGraphql.mutation(
                'CreateBillingSetupIntent',
                ({ variables }) =>
                    variables.tenant === 'acme/'
                        ? failure()
                        : setupIntent('secret_other')
            ),
            billingGraphql.mutation('SetBillingPaymentMethod', () => failure()),
            billingGraphql.mutation('DeleteBillingPaymentMethod', async () => {
                if (++deletes > 1) {
                    await pending;
                }
                return failure();
            })
        );
        const { rerender } = render(view(), { wrapper });
        await screen.findByText('Acme card');
        fireEvent.click(screen.getByRole('button', { name: 'Make Primary' }));
        await screen.findByText(/Payment provider unavailable/);
        expect(
            screen.getByRole('button', { name: 'Make Primary' })
        ).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        await screen.findByText(/Payment provider unavailable/);
        expect(
            screen
                .getByRole('button', { name: 'Add Payment Method' })
                .hasAttribute('disabled')
        ).toBe(true);
        expect(
            screen.getByText(
                /There was an issue attempting to get a token from Stripe/
            )
        ).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        await waitFor(() => expect(deletes).toBe(2));
        tenant.selectedTenant = 'other/';
        rerender(view());
        await act(async () => release());
        await screen.findByText('Acme card');
        expect(screen.queryByText(/Payment provider unavailable/)).toBeNull();
        expect(
            screen.queryByText(
                /There was an issue attempting to get a token from Stripe/
            )
        ).toBeNull();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('prefetches setup on tenant change and payment refresh, preserves auto-open, and ignores late setup', async () => {
        let release!: () => void;
        const pending = new Promise<void>((resolve) => {
            release = resolve;
        });
        let setups = 0;
        server.use(
            billingGraphql.mutation('CreateBillingSetupIntent', async () => {
                const attempt = ++setups;
                if (attempt === 1) {
                    await pending;
                }
                return setupIntent(`secret_${attempt}`);
            }),
            billingGraphql.mutation('SetBillingPaymentMethod', () =>
                HttpResponse.json({
                    data: {
                        setBillingPaymentMethod: payload(
                            billing([paymentMethod], paymentMethod.id)
                        ),
                    },
                })
            )
        );
        const { rerender } = render(view(true), { wrapper });
        await screen.findByText('Acme card');
        expect(setups).toBe(1);
        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(screen.queryByTestId('stripe-form')).toBeNull();
        expect(
            screen
                .getByRole('button', { name: 'Add Payment Method' })
                .hasAttribute('disabled')
        ).toBe(true);

        tenant.selectedTenant = 'other/';
        rerender(view(true));
        await screen.findByTestId('stripe-form');
        await act(async () => release());
        expect(
            screen.getByTestId('stripe-form').getAttribute('data-secret')
        ).toBe('secret_2');
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        fireEvent.click(
            screen.getByRole('button', { name: 'Add Payment Method' })
        );
        await screen.findByTestId('stripe-form');
        expect(setups).toBe(2);
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        await waitFor(() => expect(setups).toBe(3));
        expect(fireGtmEvent).toHaveBeenCalledWith('Payment_Entered', {
            tenant: 'other/',
        });
    });

    test('closes a saved Stripe form after primary failure, allows table recovery, and scopes late Stripe completion', async () => {
        const savedMethod = {
            ...paymentMethod,
            id: 'pm_saved',
            billingDetails: {
                ...paymentMethod.billingDetails,
                name: 'Saved card',
            },
        };
        let saved = false;
        let primaryAttempts = 0;
        server.use(
            billingGraphql.query(
                'TenantBillingPaymentMethods',
                ({ variables }) =>
                    HttpResponse.json({
                        data: paymentMethodsData(
                            variables.tenant,
                            billing(
                                saved && variables.tenant === 'acme/'
                                    ? [savedMethod]
                                    : [paymentMethod]
                            )
                        ),
                    })
            ),
            billingGraphql.mutation(
                'SetBillingPaymentMethod',
                ({ variables }) => {
                    expect(variables).toEqual({
                        tenant: 'acme/',
                        paymentMethodId: 'pm_saved',
                    });
                    saved = true;
                    return ++primaryAttempts === 1
                        ? failure()
                        : HttpResponse.json({
                              data: {
                                  setBillingPaymentMethod: payload(
                                      billing([savedMethod], savedMethod.id)
                                  ),
                              },
                          });
                }
            )
        );
        const { rerender } = render(view(), { wrapper });
        await screen.findByText('Acme card');
        await waitFor(() =>
            expect(
                screen
                    .getByRole('button', { name: 'Add Payment Method' })
                    .hasAttribute('disabled')
            ).toBe(false)
        );
        fireEvent.click(
            screen.getByRole('button', { name: 'Add Payment Method' })
        );
        await screen.findByTestId('stripe-form');
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        await screen.findByText(
            /Your payment method was saved, but it could not be made primary/
        );
        await screen.findByText('Saved card');
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(fireGtmEvent).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Make Primary' }));
        await waitFor(() =>
            expect(
                screen.queryByRole('button', { name: 'Make Primary' })
            ).toBeNull()
        );
        expect(stripe.confirmSetup).toHaveBeenCalledTimes(1);

        let confirm!: () => void;
        const confirming = new Promise<void>((resolve) => {
            confirm = resolve;
        });
        stripe.confirmSetup.mockImplementationOnce(async () => {
            await confirming;
            return { setupIntent: { payment_method: 'pm_late' } };
        });
        let refreshedOriginal = false;
        server.use(
            billingGraphql.query(
                'TenantBillingPaymentMethods',
                ({ variables }) => {
                    if (variables.tenant === 'acme/') {
                        refreshedOriginal = true;
                    }
                    return HttpResponse.json({
                        data: paymentMethodsData(variables.tenant),
                    });
                }
            )
        );
        await waitFor(() =>
            expect(
                screen
                    .getByRole('button', { name: 'Add Payment Method' })
                    .hasAttribute('disabled')
            ).toBe(false)
        );
        fireEvent.click(
            screen.getByRole('button', { name: 'Add Payment Method' })
        );
        await screen.findByTestId('stripe-form');
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        await waitFor(() =>
            expect(stripe.confirmSetup).toHaveBeenCalledTimes(2)
        );
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        tenant.selectedTenant = 'other/';
        rerender(view());
        await screen.findByText('Acme card');
        await act(async () => confirm());
        await waitFor(() => expect(refreshedOriginal).toBe(true));
        expect(primaryAttempts).toBe(2);
        expect(fireGtmEvent).not.toHaveBeenCalled();
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
