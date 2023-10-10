import { supabaseClient, TABLES } from 'services/supabase';
import { Tenants } from 'types';

const COLUMNS = ['tasks_quota', 'collections_quota', 'tenant', 'trial_start'];

const getTenantDetails = () => {
    return supabaseClient
        .from<Tenants>(TABLES.TENANTS)
        .select(COLUMNS.join(','));
};

export { getTenantDetails };
