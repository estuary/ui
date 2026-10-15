import type { TenantBillingInvoicesQuery } from 'src/gql-types/graphql';
import type { TenantPaymentDetails } from 'src/types';
import type { Client } from 'urql';

import { TENANT_BILLING_PAYMENT_METHODS_QUERY } from 'src/api/gql/billing';

const getTenantPaymentMethods = async (client: Client, tenant: string) => {
    const { data, error } = await client
        .query(TENANT_BILLING_PAYMENT_METHODS_QUERY, { tenant })
        .toPromise();

    return error
        ? { error }
        : {
              data: {
                  tenant,
                  payment_methods: data?.tenant?.billing.paymentMethods,
              },
          };
};

export interface InvoiceLineItem {
    description: string;
    count: number;
    rate: number;
    subtotal: number;
}

export type Invoice = NonNullable<
    TenantBillingInvoicesQuery['tenant']
>['billing']['invoices']['edges'][number]['node'];

export interface MultiplePaymentMethods {
    responses: any[];
    errors: any[];
}

// Very few people are using multiple prefixes (Q4 2023) so allowing us to check 5 for now
//  is more than enough. This also prevents people in the support role from hammering the server
//  fetching payment methods for tenants they do now "own"
export const MAX_TENANTS = 5;
export const getPaymentMethodsForTenants = async (
    client: Client,
    tenants: TenantPaymentDetails[]
): Promise<MultiplePaymentMethods> => {
    // Callers pass at most MAX_TENANTS tenants.
    const responses: any[] = await Promise.all(
        tenants.map((tenantDetail) =>
            !tenantDetail.trial_start ||
            tenantDetail.payment_provider !== 'stripe' ||
            tenantDetail.gcm_account_id
                ? {
                      data: {
                          tenant: tenantDetail.tenant,
                          skipPaymentMethod: true,
                      },
                  }
                : getTenantPaymentMethods(client, tenantDetail.tenant)
        )
    );

    return {
        responses: responses.filter((r) => r.data).map((r) => r.data),
        errors: responses.filter((r) => r.error).map((r) => r.error),
    };
};
