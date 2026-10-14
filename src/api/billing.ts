import type { TenantPaymentDetails } from 'src/types';
import type { Client } from 'urql';

import pLimit from 'p-limit';

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

export interface Invoice {
    billed_prefix: string;
    date_start: string; // Timestamp
    date_end: string; // Timestamp
    line_items: InvoiceLineItem[];
    subtotal: number;
    invoice_type: 'final' | 'preview' | 'manual';
    extra?: {
        processed_data_gb: number;
        task_usage_hours: number;
    };
    // From Stripe, and only read for the billing history.
    status?: string | null;
    invoice_pdf?: string | null;
    hosted_invoice_url?: string | null;
}

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
    const limiter = pLimit(3);
    const promises: Array<Promise<any>> = [];
    let count = 0;

    tenants.some((tenantDetail) => {
        if (
            !tenantDetail.trial_start ||
            tenantDetail.payment_provider !== 'stripe' ||
            tenantDetail.gcm_account_id
        ) {
            promises.push(
                new Promise((resolve) => {
                    resolve({
                        data: {
                            tenant: tenantDetail.tenant,
                            skipPaymentMethod: true,
                        },
                    });
                })
            );
        } else {
            promises.push(
                limiter(() =>
                    getTenantPaymentMethods(client, tenantDetail.tenant)
                )
            );
        }

        count += 1;
        return count >= MAX_TENANTS;
    });

    const responses = await Promise.all(promises);

    return {
        responses: responses.filter((r) => r.data).map((r) => r.data),
        errors: responses.filter((r) => r.error).map((r) => r.error),
    };
};
