import { getTenantDetails, getTenantHidesPreview } from 'api/tenants';
import { extendedPollSettings } from 'context/SWR';
import { useMemo } from 'react';
import useSWR from 'swr';
import { TenantHidesDataPreview, Tenants } from 'types';
import { hasLength, stripPathing } from 'utils/misc-utils';
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

export function useTenantsHideDetails(entityName: string) {
    const query = useMemo(() => {
        if (!hasLength(entityName)) {
            return null;
        }

        const tenantName = stripPathing(entityName, true);

        if (!hasLength(tenantName)) {
            return null;
        }

        return getTenantHidesPreview(tenantName);
    }, [entityName]);

    const { data, error } = useSelectSingleNew<TenantHidesDataPreview>(
        query,
        extendedPollSettings
    );

    const response = useMemo(
        () => (data ? Boolean(data.data.hide_preview) : null),
        [data]
    );

    return useMemo(
        () => ({
            hide: response,
            error,
        }),
        [error, response]
    );
}

export default useTenants;
