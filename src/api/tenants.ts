import {
    DEFAULT_PAGING_SIZE,
    pagedFetchAll,
    parsePagedFetchAllResponse,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { Tenants } from 'types';

const COLUMNS = [
    'collections_quota',
    'payment_provider',
    'tasks_quota',
    'tenant',
    'trial_start',
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

export { getTenantDetails };
