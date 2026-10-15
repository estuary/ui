import type { TenantPaymentDetails } from 'src/types';
import type { Client } from 'urql';

import { TENANT_BILLING_PAYMENT_METHODS_QUERY } from 'src/api/gql/billing';
import { FUNCTIONS, invokeSupabase, TABLES } from 'src/services/supabase';
import { supabaseClient } from 'src/services/supabaseClient';
import { formatDateForApi } from 'src/utils/billing-utils';

const OPERATIONS = {
    GET_TENANT_INVOICE: 'get-tenant-invoice',
};

export interface StripeInvoice {
    id: string;
    amount_due: number;
    invoice_pdf: string;
    hosted_invoice_url: string;
    status: 'open' | 'paid' | 'void' | 'uncollectable';
}

export const getTenantInvoice = (
    tenant: string,
    date_start: string,
    date_end: string,
    type: 'manual' | 'final'
) => {
    return invokeSupabase<{ invoice?: StripeInvoice | null }>(
        FUNCTIONS.BILLING,
        {
            operation: OPERATIONS.GET_TENANT_INVOICE,
            tenant,
            date_start,
            date_end,
            type,
        }
    );
};

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
}

const invoicesQuery = [
    'billed_prefix',
    'date_start',
    'date_end',
    'line_items',
    'subtotal',
    'invoice_type',
    'extra',
].join(', ');

export const getInvoicesBetween = (
    billed_prefix: string,
    date_start: Date,
    date_end: Date
) => {
    const formattedStart = formatDateForApi(date_start);
    const formattedEnd = formatDateForApi(date_end);

    return supabaseClient
        .from(TABLES.INVOICES_EXT)
        .select(invoicesQuery)
        .filter('billed_prefix', 'eq', billed_prefix)
        .or(
            `invoice_type.eq.manual,and(${[
                `date_start.gte.${formattedStart}`,
                `date_start.lte.${formattedEnd}`,
                `date_end.gte.${formattedStart}`,
                `date_end.lte.${formattedEnd}`,
            ].join(',')})`
        )
        .order('date_start', { ascending: false })
        .throwOnError()
        .returns<Invoice[]>();
};

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
