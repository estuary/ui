import {
    PostgrestMaybeSingleResponse,
    PostgrestResponse,
    PostgrestSingleResponse,
} from '@supabase/postgrest-js';
import { format, isBefore, parse, startOfMonth } from 'date-fns';
import {
    FUNCTIONS,
    RPCS,
    TABLES,
    invokeSupabase,
    supabaseClient,
} from 'services/supabase';

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
    month: string,
    type: 'Manual' | 'Usage'
) => {
    return invokeSupabase<{ invoice?: StripeInvoice | null }>(
        FUNCTIONS.BILLING,
        {
            operation: OPERATIONS.GET_TENANT_INVOICE,
            tenant,
            month,
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

export interface ManualBill {
    usd_cents: number;
    description: string;
    date_start: string;
    date_end: string;
    tenant?: string;
}

const manualBillsQuery = [
    'description',
    'usd_cents',
    'date_start',
    'date_end',
].join(', ');

export const getManualBills = (
    billed_prefix: string,
    active_during: string | Date
): PromiseLike<PostgrestResponse<ManualBill>> => {
    const fmt = "yyyy-MM-dd' 00:00:00+00'";
    const formattedDate: string =
        typeof active_during === 'string'
            ? active_during
            : format(active_during, fmt);

    return supabaseClient
        .from<ManualBill>(TABLES.MANUAL_BILLS)
        .select(manualBillsQuery)
        .filter('tenant', 'eq', billed_prefix)
        .filter('date_start', 'lte', formattedDate)
        .filter('date_end', 'gte', formattedDate)
        .throwOnError();
};

export interface InvoiceLineItem {
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
