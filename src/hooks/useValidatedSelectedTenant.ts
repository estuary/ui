import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';

// The globally selected organization, returned only once it is known to be one
// the user actually holds — otherwise null.
//
// `selectedTenant` is persisted, so on load it holds a value before anything
// has confirmed it: an empty string on a first visit, or a tenant the user may
// since have lost access to. `useInitializeSelectedTenant` reconciles it, but
// only after the entities store hydrates. Tenant-scoped queries pause on a null
// return rather than issue a request the API would reject.
export function useValidatedSelectedTenant(): string | null {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const tenantNames = useEntitiesStore_tenantsWithAdmin();

    return selectedTenant && tenantNames.includes(selectedTenant)
        ? selectedTenant
        : null;
}
