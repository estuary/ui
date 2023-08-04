import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { format } from 'date-fns';
import {
    FUNCTIONS,
    invokeSupabase,
    RPCS,
    supabaseClient,
} from 'services/supabase';

const OPERATIONS = {
    SETUP_INTENT: 'setup-intent',
    GET_TENANT_PAYMENT_METHODS: 'get-tenant-payment-methods',
    DELETE_TENANT_PAYMENT_METHODS: 'delete-tenant-payment-method',
    SET_PRIMARY: 'set-tenant-primary-payment-method',
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

interface InvoiceLineItem {
    description: 'string';
    count: number;
    rate: number;
    subtotal: number;
}

export interface BillingRecord {
    billed_prefix: string;
    billed_month: string; // Timestamp
    processed_data_gb: number | null;
    recurring_fee: number;
    task_usage_hours: number | null;
    line_items: InvoiceLineItem[];
    subtotal: number;
}

export const getBillingRecord = (
    billed_prefix: string,
    month: string | Date
) => {
    const formattedMonth: string =
        typeof month === 'string'
            ? month
            : format(month, "yyyy-MM-dd' 00:00:00+00'");

    return supabaseClient
        .rpc<BillingRecord>(RPCS.BILLING_REPORT, {
            billed_prefix,
            billed_month: formattedMonth,
        })
        .throwOnError()
        .single();
};

export const getBillingHistory = async (
    tenant: string,
    dateRange: string[]
): Promise<PostgrestSingleResponse<BillingRecord>[]> => {
    const promises: PromiseLike<PostgrestSingleResponse<BillingRecord>>[] =
        dateRange.map((date) => getBillingRecord(tenant, date));

    const res = await Promise.all(promises);

    return res;
};
