import { getTenantDetails } from 'api/tenants';
import useSWR from 'swr';
import { Tenants } from 'types';

const defaultResponse: Tenants[] = [];

function useTenants() {
    const { data, error, isValidating } = useSWR('useTenants', () =>
        getTenantDetails()
    );

    return {
        tenants: data ? (data.data as Tenants[]) : defaultResponse,
        error,
        isValidating,
    };
}

export default useTenants;
