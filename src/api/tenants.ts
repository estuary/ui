import { Tenants } from 'types';

import { supabaseClient, TABLES } from 'services/supabase';

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
