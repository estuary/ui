import { getTenantDetails } from 'api/tenants';
import { Tenants } from 'types';
import { useSelectNew } from './supabase-swr/hooks/useSelect';

const defaultResponse: Tenants[] = [];

function useTenants() {
    const { data, error, mutate, isValidating } = useSelectNew(
        getTenantDetails()
    );

    return {
        tenants: data ? (data.data as Tenants[]) : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useTenants;
