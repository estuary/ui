import { supabaseClient, TABLES } from 'services/supabase';
import { Tenants } from 'types';

const getTenantDetails = () => {
    const queryBuilder = supabaseClient.from<Tenants>(TABLES.TENANTS).select(
        `    
            tasks_quota,
            collections_quota,
            tenant
        `
    );

    return queryBuilder;
};

export { getTenantDetails };
