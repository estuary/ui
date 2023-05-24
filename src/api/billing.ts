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

// TODO (billing): Add return type annotation.
export const getBillingHistory = (
    billed_prefix: string,
    billed_month: string
) => {
    return supabaseClient
        .rpc(RPCS.BILLING_REPORT, {
            billed_prefix,
            billed_month,
        })
        .throwOnError()
        .single();
};
