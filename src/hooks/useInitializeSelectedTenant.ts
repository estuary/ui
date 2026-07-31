import { useEffect, useRef } from 'react';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';
import { hasLength } from 'src/utils/misc-utils';

// Initialize the persisted, globally selected organization independently of
// any selector UI. Deep links take precedence, followed by a still-valid
// persisted selection, then the first organization available to the user.
export function useInitializeSelectedTenant() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const setSelectedTenant = useTenantStore(
        (state) => state.setSelectedTenant
    );
    const tenantNames = useEntitiesStore_tenantsWithAdmin();

    const prefixParam = useGlobalSearchParams(GlobalSearchParams.PREFIX);
    const appliedPrefixParam = useRef<string | null>(null);

    useEffect(() => {
        if (!hasLength(tenantNames)) {
            return;
        }

        if (
            hasLength(prefixParam) &&
            tenantNames.includes(prefixParam) &&
            prefixParam !== appliedPrefixParam.current
        ) {
            appliedPrefixParam.current = prefixParam;

            if (prefixParam !== selectedTenant) {
                setSelectedTenant(prefixParam);
            }

            return;
        }

        if (!(selectedTenant && tenantNames.includes(selectedTenant))) {
            setSelectedTenant(tenantNames[0]);
        }
    }, [prefixParam, selectedTenant, setSelectedTenant, tenantNames]);
}
