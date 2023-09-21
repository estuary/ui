import { PostgrestResponse } from '@supabase/postgrest-js';
import {
    FUNCTIONS,
    TABLES,
    invokeSupabase,
    supabaseClient,
} from 'services/supabase';
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
    type: 'manual' | 'usage'
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
    invoice_type: 'usage' | 'manual' | 'current_month';
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
