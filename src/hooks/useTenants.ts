import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getTenantDetails, getTenantHidesPreview } from 'api/tenants';
import { useMemo } from 'react';
import { TenantPaymentDetails } from 'types';
import { DEMO_TENANT, hasLength, stripPathing } from 'utils/misc-utils';

const defaultResponse: TenantPaymentDetails[] = [];

export function useTenantsDetailsForPayment(tenants: string[]) {
    const { data, error, isValidating } = useQuery(
        hasLength(tenants) ? getTenantDetails(tenants) : null
    );

    return {
        tenants: data ?? defaultResponse,
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
        revalidateOnFocus: true,
        revalidateOnMount: true,
    });

    const response = useMemo(() => {
        // We always let the demo show preview
        if (isDemo) {
            return false;
        }

        // We have a response so check it
        if (data) {
            return Boolean(data.hide_preview);
        }

        // Null means the call is done but the user does not have access
        //  to see the tenant details
        if (data === null) {
            return true;
        }

        // We still don't have a good enough response so default to null
        return null;
    }, [data, isDemo]);

    return useMemo(
        () => ({
            hide: response,
            error,
            isValidating,
        }),
        [error, isValidating, response]
    );
}
