import type { TenantPaymentDetails } from 'src/types';
import type { Client } from 'urql';

import { describe, expect, test, vi } from 'vitest';

import { getPaymentMethodsForTenants } from 'src/api/gql/billing';

const selfServe: TenantPaymentDetails = {
    collection_method: 'charge_default_payment_method',
    gcm_account_id: null,
    payment_provider: 'stripe',
    plan_kind: 'self_serve',
    tenant: 'acmeCo/',
    trial_start: '2026-01-01',
};

function mockClient() {
    const query = vi.fn(() => ({
        toPromise: () =>
            Promise.resolve({
                data: { tenant: { billing: { paymentMethods: [] } } },
            }),
    }));

    return { client: { query } as unknown as Client, query };
}

describe('getPaymentMethodsForTenants', () => {
    test('fetches the payment methods of a self-serve tenant that pays by card', async () => {
        const { client, query } = mockClient();

        const { responses } = await getPaymentMethodsForTenants(client, [
            selfServe,
        ]);

        expect(query).toHaveBeenCalledTimes(1);
        expect(responses).toEqual([{ tenant: 'acmeCo/', payment_methods: [] }]);
    });

    test.each<[string, Partial<TenantPaymentDetails>]>([
        ['contract', { plan_kind: 'contract' }],
        ['internal', { plan_kind: 'internal' }],
        ['invoiced', { collection_method: 'send_invoice' }],
    ])('skips a tenant that is %s', async (_name, overrides) => {
        const { client, query } = mockClient();

        const { responses } = await getPaymentMethodsForTenants(client, [
            { ...selfServe, ...overrides },
        ]);

        expect(query).not.toHaveBeenCalled();
        expect(responses).toEqual([
            { tenant: 'acmeCo/', skipPaymentMethod: true },
        ]);
    });
});
