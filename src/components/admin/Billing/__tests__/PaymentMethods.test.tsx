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
const primarySet = (method = paymentMethod) => ({
    setBillingPaymentMethod: payload(billing([method], method.id)),
});
const failure = () =>
    HttpResponse.json<{ errors: { message: string }[] }>({
        errors: [{ message: 'Payment provider unavailable' }],
    });
const addPaymentMethodEnabled = () =>
    waitFor(() =>
        expect(
            screen
                .getByRole('button', { name: 'Add Payment Method' })
                .hasAttribute('disabled')
        ).toBe(false)
    );

// Like the page, remount both sections for each tenant.
const view = (showAddPayment = false) => (
    <>
        <div data-testid="pricing">
            <PricingTierDetails key={tenant.selectedTenant} />
        </div>
        <PaymentMethods
            key={tenant.selectedTenant}
            canEdit
            showAddPayment={showAddPayment}
        />
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
        billingGraphql.query('TenantBillingPaymentMethods', () =>
            HttpResponse.json({ data: paymentMethodsData() })
        ),
        billingGraphql.mutation('CreateBillingSetupIntent', () =>
            setupIntent()
        ),
        billingGraphql.mutation('SetBillingPaymentMethod', () =>
            HttpResponse.json({ data: primarySet() })
        )
    );
});

describe('billing payments', () => {
    test('shares primary and delete results with the table and pricing', async () => {
        let paymentReads = 0;
        server.use(
            billingGraphql.query('TenantBillingPaymentMethods', () => {
                paymentReads++;
                return HttpResponse.json({ data: paymentMethodsData() });
            }),
            billingGraphql.mutation('DeleteBillingPaymentMethod', () =>
                HttpResponse.json({
                    data: { deleteBillingPaymentMethod: payload(billing([])) },
                })
            )
        );
        render(view(), { wrapper });
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
    });

    test('shows mutation and setup failures', async () => {
        server.use(
            billingGraphql.mutation('CreateBillingSetupIntent', () =>
                failure()
            ),
            billingGraphql.mutation('SetBillingPaymentMethod', () => failure()),
            billingGraphql.mutation('DeleteBillingPaymentMethod', () =>
                failure()
            )
        );
        render(view(), { wrapper });
        await screen.findByText('Acme card');
        fireEvent.click(screen.getByRole('button', { name: 'Make Primary' }));
        await screen.findByText('Payment provider unavailable');
        expect(
            screen.getByRole('button', { name: 'Make Primary' })
        ).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        await screen.findByText('Payment provider unavailable');
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
    });

    test('prefetches setup, opens from the add-payment route, and refreshes setup after adding', async () => {
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
            })
        );
        render(view(true), { wrapper });
        await screen.findByRole('dialog');
        expect(screen.queryByTestId('stripe-form')).toBeNull();
        expect(
            screen
                .getByRole('button', { name: 'Add Payment Method' })
                .hasAttribute('disabled')
        ).toBe(true);

        await act(async () => release());
        expect(
            (await screen.findByTestId('stripe-form')).getAttribute(
                'data-secret'
            )
        ).toBe('secret_1');
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        await waitFor(() => expect(setups).toBe(2));
        expect(fireGtmEvent).toHaveBeenCalledWith('Payment_Entered', {
            tenant: 'acme/',
        });
    });

    test('closes the form and refreshes the table when a new method fails to become primary', async () => {
        const savedMethod = {
            ...paymentMethod,
            id: 'pm_saved',
            billingDetails: {
                ...paymentMethod.billingDetails,
                name: 'Saved card',
            },
        };
        let saved = false;
        server.use(
            billingGraphql.query('TenantBillingPaymentMethods', () =>
                HttpResponse.json({
                    data: paymentMethodsData(
                        billing(saved ? [savedMethod] : [paymentMethod])
                    ),
                })
            ),
            billingGraphql.mutation('SetBillingPaymentMethod', () => {
                saved = true;
                return failure();
            })
        );
        render(view(), { wrapper });
        await addPaymentMethodEnabled();
        fireEvent.click(
            screen.getByRole('button', { name: 'Add Payment Method' })
        );
        await screen.findByTestId('stripe-form');
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        await screen.findByText('Payment provider unavailable');
        await screen.findByText('Saved card');
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    test('shows a failed read again after switching tenants and back', async () => {
        let failedReads = 0;
        server.use(
            billingGraphql.query(
                'TenantBillingPaymentMethods',
                ({ variables }) => {
                    if (variables.tenant !== 'acme/') {
                        return HttpResponse.json({
                            data: paymentMethodsData(),
                        });
                    }
                    failedReads++;
                    // `billing` is non-null, so its error nulls the tenant.
                    return HttpResponse.json({
                        data: { tenant: null },
                        errors: [
                            {
                                message: 'Payment provider unavailable',
                                path: ['tenant', 'billing'],
                            },
                        ],
                    });
                }
            )
        );
        const pricing = () => (
            <PricingTierDetails key={tenant.selectedTenant} />
        );
        const { rerender } = render(pricing(), { wrapper });
        await screen.findByText('Pricing information unavailable.');

        tenant.selectedTenant = 'other/';
        rerender(pricing());
        await screen.findByText('Cloud tier');
        tenant.selectedTenant = 'acme/';
        rerender(pricing());

        await screen.findByText('Pricing information unavailable.');
        expect(failedReads).toBe(2);
    });
});
