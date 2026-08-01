import { useMemo } from 'react';

import { useLiveSpecs } from 'src/api/gql/liveSpecs';
import { useStorageMappings } from 'src/api/gql/storageMappings';
import { useTenantStore } from 'src/stores/Tenant';

// Catalog prefixes a service account can be homed at or granted access to,
// derived from the tenant's live specs and storage mappings and scoped to the
// globally selected tenant. Shared by the create dialog and the grant dialog.
export function usePrefixLeaves() {
    const { storageMappings } = useStorageMappings();
    const liveSpecNames = useLiveSpecs();
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const leaves = useMemo(
        () =>
            [
                ...liveSpecNames.map((name) =>
                    // strip the catalog name, keeping the containing prefix
                    name.slice(0, name.lastIndexOf('/') + 1)
                ),
                ...storageMappings.map((sm) => sm.catalogPrefix),
            ].filter((leaf) => leaf.startsWith(selectedTenant)),
        [liveSpecNames, storageMappings, selectedTenant]
    );

    return { leaves, selectedTenant };
}
