import type { TenantHidesDataPreview, TenantPaymentDetails } from 'src/types';

import { TABLES } from 'src/services/supabase';
import { supabaseClient } from 'src/services/supabaseClient';

const COLUMNS = [
    'collection_method',
    'gcm_account_id',
    'payment_provider',
    'plan_kind',
    'tenant',
    'trial_start',
];

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
