import { supabaseClient } from 'services/supabase';
import { Tenants } from 'types';

const getTenantDetails = () => {
    const queryBuilder = supabaseClient.from<Tenants>('tenants').select(
        `    
            tasks_quota,
            collections_quota,
            tenant
        `
    );

    return queryBuilder;
};

export { getTenantDetails };
