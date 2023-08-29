import {
    PostgrestMaybeSingleResponse,
    PostgrestSingleResponse,
} from '@supabase/postgrest-js';
import { format, isBefore, parse, startOfMonth } from 'date-fns';
import {
    FUNCTIONS,
    invokeSupabase,
    RPCS,
    supabaseClient,
    TABLES,
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
    // In `billing_historicals` this is called tenant
    // and so needs to be included here in order to
    // filter by tenant
    tenant?: string;
    billed_prefix: string;
    billed_month: string; // Timestamp
    processed_data_gb: number | null;
    recurring_fee: number;
    task_usage_hours: number | null;
    line_items: InvoiceLineItem[];
    subtotal: number;
}

const billingHistoricalQuery = [
    'billed_prefix:tenant',
    'billed_month',
    'report->processed_data_gb',
    'report->recurring_fee',
    'report->task_usage_hours',
    'report->line_items',
    'report->subtotal',
].join(', ');

export const getBillingRecord = (
    billed_prefix: string,
    month: string | Date
): PromiseLike<PostgrestMaybeSingleResponse<BillingRecord>> => {
    const fmt = "yyyy-MM-dd' 00:00:00+00'";
    const formattedMonth: string =
        typeof month === 'string' ? month : format(month, fmt);

    // If we're asking for a previous month, look up billing_historicals
    if (
        isBefore(
            startOfMonth(parse(formattedMonth, fmt, new Date())),
            startOfMonth(new Date())
        )
    ) {
        return supabaseClient
            .from<BillingRecord>(TABLES.BILLING_HISTORICALS)
            .select(billingHistoricalQuery)
            .filter('tenant', 'eq', billed_prefix)
            .filter('billed_month', 'eq', formattedMonth)
            .throwOnError()
            .maybeSingle();
    } else {
        return supabaseClient
            .rpc<BillingRecord>(RPCS.BILLING_REPORT, {
                billed_prefix,
                billed_month: formattedMonth,
            })
            .throwOnError()
            .single();
    }
};

function isSingleResponse<T>(
    arg: PostgrestMaybeSingleResponse<T>
): arg is PostgrestSingleResponse<T> {
    return arg.body !== null;
}

// TODO (billing) need to make this so it does not cause multipl calls
//  and instead just builds up a single query that matches all months
export const getBillingHistory = async (
    tenant: string,
    dateRange: string[]
): Promise<PostgrestSingleResponse<BillingRecord>[]> => {
    const promises: PromiseLike<PostgrestMaybeSingleResponse<BillingRecord>>[] =
        dateRange.map((date) => getBillingRecord(tenant, date));

    const resolved = await Promise.all(promises);

    return resolved.filter(isSingleResponse);
};
