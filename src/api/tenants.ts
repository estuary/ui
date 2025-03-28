import { supabaseClient } from 'src/context/GlobalProviders';
import { TABLES } from 'src/services/supabase';
import { TenantHidesDataPreview, TenantPaymentDetails } from 'src/types';

const COLUMNS = ['gcm_account_id', 'payment_provider', 'tenant', 'trial_start'];

const getTenantDetails = (tenants: string[]) => {
    return supabaseClient
        .from(TABLES.TENANTS)
        .select(COLUMNS.join(','))
        .in('tenant', tenants)
        .returns<TenantPaymentDetails[]>();
};

const getTenantHidesPreview = (tenant: string) => {
    return supabaseClient
        .from(TABLES.TENANTS)
        .select('hide_preview')
        .eq('tenant', tenant)
        .maybeSingle<TenantHidesDataPreview>();
};

export { getTenantDetails, getTenantHidesPreview };
