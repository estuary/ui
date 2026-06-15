import { useEffect, useRef } from 'react';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';
import { hasLength } from 'src/utils/misc-utils';

// Tenant selection is global app state, so it is bootstrapped here rather than
// in any UI component: mounted once in TenantGuard (which only renders the app
// for users that have tenant access), it does not depend on a menu's mount
// lifecycle. Once the tenant list loads: honor a `?prefix=` deep link (e.g. the
// billing "add payment method" CTA) the first time it appears, then keep a
// still-valid selection, otherwise fall back to the first available tenant.
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
