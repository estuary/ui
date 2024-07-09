import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getTenantDetails, getTenantHidesPreview } from 'api/tenants';
import { EXTENDED_POLL_INTERVAL } from 'context/SWR';
import { useMemo } from 'react';
import useSWR from 'swr';
import { Tenants } from 'types';
import { DEMO_TENANT, hasLength, stripPathing } from 'utils/misc-utils';

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

    const { data, error, isValidating } = useQuery(query, {
        refreshInterval: EXTENDED_POLL_INTERVAL,
    });

    const response = useMemo(
        () => (isDemo ? false : data ? Boolean(data.hide_preview) : null),
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
