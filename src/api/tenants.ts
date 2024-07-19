import { supabaseClient } from 'context/Supabase';
import { TABLES } from 'services/supabase';
import { TenantHidesDataPreview, Tenants } from 'types';

const COLUMNS = [
    'gcm_account_id',
    'payment_provider',
    'tasks_quota',
    'tenant',
    'trial_start',
    'hide_preview',
];

const getTenantDetails = async (tenants: string[]) => {
    return supabaseClient
        .from(TABLES.TENANTS)
        .select(COLUMNS.join(','))
        .in('tenant', tenants)
        .returns<Tenants[]>();
};

const getTenantHidesPreview = (tenant: string) => {
    return supabaseClient
        .from(TABLES.TENANTS)
        .select('hide_preview')
        .eq('tenant', tenant)
        .single<TenantHidesDataPreview>();
};

export { getTenantDetails, getTenantHidesPreview };
