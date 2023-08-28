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

export interface BillingReport {
    processed_data_gb: number | null;
    recurring_fee: number;
    task_usage_hours: number | null;
    line_items: InvoiceLineItem[];
    subtotal: number;
}

export interface BillingHistoricals {
    billed_prefix: string;
    billed_month: string; // Timestamp
    report: BillingReport;
}

export interface BillingRecord extends BillingReport {
    billed_prefix: string;
    billed_month: string; // Timestamp
}

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
        const req = supabaseClient
            .from<BillingHistoricals>(TABLES.BILLING_HISTORICALS)
            .select('billed_prefix, billed_month, report')
            .filter('billed_prefix', 'eq', billed_prefix)
            .filter('billed_month', 'eq', formattedMonth);

        const url = (req as any).url;

        const prom: PromiseLike<PostgrestMaybeSingleResponse<BillingRecord>> =
            req.then((response) => {
                if (response.body && response.body.length > 0) {
                    if (response.body.length > 1) {
                        throw new Error(
                            `Found multiple billing historical records where at most one was expected. prefix: ${billed_prefix}, month: ${formattedMonth}`
                        );
                    }
                    const modified_body: BillingRecord = {
                        billed_month: response.body[0].billed_month,
                        billed_prefix: response.body[0].billed_prefix,
                        ...response.body[0].report,
                    };
                    return {
                        ...response,
                        body: modified_body,
                        data: modified_body,
                        url,
                    };
                } else {
                    return {
                        ...response,
                        body: null,
                        data: null,
                        url,
                    };
                }
            });

        // Hack alert: `useSelectNew` actually expects to be passed a
        // PostgrestFilterBuilder which has a protected `url: URL` field
        // which `useSelectNew` uses as the key for SWR purposes. If we `.map()`
        // the promise-like object returned by the Supabase SDK, we lose that
        // hidden URL field in the process, breaking SWR.
        // So... for the moment, this hacks it back into existence.
        (prom as any).url = url;
        return prom;
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

export const getBillingHistory = async (
    tenant: string,
    dateRange: string[]
): Promise<PostgrestSingleResponse<BillingRecord>[]> => {
    const promises: PromiseLike<PostgrestMaybeSingleResponse<BillingRecord>>[] =
        dateRange.map((date) => getBillingRecord(tenant, date));

    const resolved = await Promise.all(promises);

    return resolved.filter(isSingleResponse);
};
