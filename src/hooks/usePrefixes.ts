import { useMemo } from 'react';

import { useLiveSpecs } from 'src/api/gql/liveSpecs';
import { useStorageMappings } from 'src/api/gql/storageMappings';

/** Catalog prefixes from live specs and storage mappings for the selected tenant. */
export function usePrefixes(): string[] {
    const liveSpecNames = useLiveSpecs();
    const { storageMappings } = useStorageMappings();

    return useMemo(
        () =>
            Array.from(
                new Set([
                    ...liveSpecNames.map((name) =>
                        name.slice(0, name.lastIndexOf('/') + 1)
                    ),
                    ...storageMappings.map((mapping) => mapping.catalogPrefix),
                ])
            ),
        [liveSpecNames, storageMappings]
    );
}
