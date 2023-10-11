import { PostgrestResponse } from '@supabase/postgrest-js';
import pLimit from 'p-limit';
import {
    FUNCTIONS,
    TABLES,
    invokeSupabase,
    supabaseClient,
} from 'services/supabase';
import { Tenants } from 'types';
import { formatDateForApi } from 'utils/billing-utils';

const OPERATIONS = {
    SETUP_INTENT: 'setup-intent',
    GET_TENANT_PAYMENT_METHODS: 'get-tenant-payment-methods',
    DELETE_TENANT_PAYMENT_METHODS: 'delete-tenant-payment-method',
    SET_PRIMARY: 'set-tenant-primary-payment-method',
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

export const getSetupIntentSecret = (tenant: string) => {
    return invokeSupabase<any>(FUNCTIONS.BILLING, {
        operation: OPERATIONS.SETUP_INTENT,
        tenant,
    });
};

export const getTenantPaymentMethods = (tenant: string) => {
    return invokeSupabase<any>(FUNCTIONS.BILLING, {
        operation: OPERATIONS.GET_TENANT_PAYMENT_METHODS,
        tenant,
    });
};

export const deleteTenantPaymentMethod = (tenant: string, id: string) => {
    return invokeSupabase<any>(FUNCTIONS.BILLING, {
        operation: OPERATIONS.DELETE_TENANT_PAYMENT_METHODS,
        tenant,
        id,
    });
};

export const setTenantPrimaryPaymentMethod = (tenant: string, id: string) => {
    return invokeSupabase<any>(FUNCTIONS.BILLING, {
        operation: OPERATIONS.SET_PRIMARY,
        tenant,
        id,
    });
};

export interface InvoiceLineItem {
    description: 'string';
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
): PromiseLike<PostgrestResponse<Invoice>> => {
    const formattedStart = formatDateForApi(date_start);
    const formattedEnd = formatDateForApi(date_end);

    return supabaseClient
        .from<Invoice>(TABLES.INVOICES)
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
        .throwOnError();
};

export interface MultiplePaymentMethods {
    responses: any[];
    errors: any[];
}

// Very few people are using multiple prefixes (Q4 2023) so allowing us to check 5 for now
//  is more than enough. This also prevents people in the support role from hammering the server
//  fetching payment methods for tenants they do now "own"
const MAX_TENANTS = 5;
export const getPaymentMethodsForTenants = async (
    tenants: Tenants[]
): Promise<MultiplePaymentMethods> => {
    const limiter = pLimit(3);
    const promises: Array<Promise<any>> = [];
    let count = 0;

    tenants.some((tenantDetail) => {
        if (tenantDetail.pays_externally) {
            return count;
        }

        promises.push(
            limiter(() => getTenantPaymentMethods(tenantDetail.tenant))
        );
        count += 1;
        return count >= MAX_TENANTS;
    });

    const responses = await Promise.all(promises);

    return {
        responses: responses.filter((r) => r.data).map((r) => r.data),
        errors: responses.filter((r) => r.error).map((r) => r.error),
    };
};
