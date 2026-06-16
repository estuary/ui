import { useEffect, useRef } from 'react';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';
import { hasLength } from 'src/utils/misc-utils';

// Ensures the app always has a tenant selected. Runs from TenantGuard, which
// mounts once for any user with tenant access, so the selection is set
// app-wide regardless of which page or menu is open. When the tenant list
// loads it honors a `?prefix=` deep link (e.g. the billing "add payment
// method" CTA) the first time it appears, then keeps a still-valid selection,
// otherwise falls back to the first available tenant.
export function useInitializeSelectedTenant() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const setSelectedTenant = useTenantStore(
        (state) => state.setSelectedTenant
    );
    const tenantNames = useEntitiesStore_tenantsWithAdmin();

    const prefixParam = useGlobalSearchParams(GlobalSearchParams.PREFIX);
    // The prefix value we've already applied. `?prefix=` isn't stripped from the
    // URL, so without this a lingering param would re-assert the selection on
    // every change and clobber an intentional org switch. Keyed by value, so a
    // new deep-link prefix still applies once.
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
