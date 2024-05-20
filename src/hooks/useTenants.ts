import { getTenantDetails, getTenantHidesPreview } from 'api/tenants';
import { useMemo } from 'react';
import useSWR from 'swr';
import { TenantHidesDataPreview, Tenants } from 'types';
import { DEMO_TENANT, hasLength, stripPathing } from 'utils/misc-utils';
import { useSelectSingleNew } from './supabase-swr/hooks/useSelectSingle';

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

export function useTenantHidesDataPreview(entityName: string) {
    const [tenantName, isDemo] = useMemo<[string, boolean]>(() => {
        const name = stripPathing(entityName, true);
        return [name, name === DEMO_TENANT];
    }, [entityName]);

    // If we end up with an entity name that cannot be used
    //  we just sit and "wait" forever. This is fine as this should not
    //  happen unless someone messes with the URL. Later - we might
    //  want to add some cool error handling here.
    const query = useMemo(() => {
        if (isDemo || !hasLength(tenantName)) {
            return null;
        }

        return getTenantHidesPreview(tenantName);
    }, [isDemo, tenantName]);

    const { data, error, isValidating } =
        useSelectSingleNew<TenantHidesDataPreview>(query, {
            refreshInterval: 15000,
        });

    const response = useMemo(
        () => (isDemo ? false : data ? Boolean(data.data.hide_preview) : null),
        [data, isDemo]
    );

    return useMemo(
        () => ({
            hide: response,
            error,
            isValidating,
        }),
        [error, isValidating, response]
    );
}

export default useTenants;
