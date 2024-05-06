import {
    DEFAULT_PAGING_SIZE,
    pagedFetchAll,
    parsePagedFetchAllResponse,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { TenantHidesDataPreview, Tenants } from 'types';

const COLUMNS = [
    'gcm_account_id',
    'payment_provider',
    'tasks_quota',
    'tenant',
    'trial_start',
    'hide_preview',
];

const getTenantDetails = async (pageSize: number = DEFAULT_PAGING_SIZE) => {
    const responses = await pagedFetchAll<Tenants>(
        pageSize,
        'getTenantDetails',
        (start) =>
            supabaseClient
                .from<Tenants>(TABLES.TENANTS)
                .select(COLUMNS.join(','))
                .range(start, start + pageSize - 1)
    );

    return parsePagedFetchAllResponse<Tenants>(responses);
};

const getTenantHidesPreview = (tenant: string) => {
    return supabaseClient
        .from<TenantHidesDataPreview>(TABLES.TENANTS)
        .select('hide_preview')
        .eq('tenant', tenant)
        .single();
};

export { getTenantDetails, getTenantHidesPreview };
