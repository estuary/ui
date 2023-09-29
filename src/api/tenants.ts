import { supabaseClient, TABLES } from 'services/supabase';
import { Tenants } from 'types';

const getTenantDetails = (tenants?: string[]) => {
    let queryBuilder = supabaseClient.from<Tenants>(TABLES.TENANTS).select(
        `    
            tasks_quota,
            collections_quota,
            tenant
        `
    );

    if (tenants && tenants.length > 0) {
        queryBuilder = queryBuilder.in('tenant', tenants);
    }

    return queryBuilder;
};

export { getTenantDetails };
