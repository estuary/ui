import { supabaseClient, TABLES } from 'services/supabase';
import { Tenants } from 'types';

const COLUMNS = [
    'collections_quota',
    'pays_externally',
    'tasks_quota',
    'tenant',
    'trial_start',
];

const getTenantDetails = () => {
    return supabaseClient
        .from<Tenants>(TABLES.TENANTS)
        .select(COLUMNS.join(','));
};

export { getTenantDetails };
