import { getTenantDetails } from 'api/tenants';
import { Tenants } from 'types';
import { useSelectNew } from './supabase-swr/hooks/useSelect';

const defaultResponse: Tenants[] = [];

function useTenants() {
    const { data, error, isValidating } = useSelectNew(getTenantDetails());

    return {
        tenants: data ? (data.data as Tenants[]) : defaultResponse,
        error,
        isValidating,
    };
}

export default useTenants;
