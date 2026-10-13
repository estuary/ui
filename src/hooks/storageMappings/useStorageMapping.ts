import { useMemo } from 'react';

import { useStorageMappingsQuery } from 'src/hooks/storageMappings/useStorageMappingsQuery';

export function useStorageMapping(tenant: string, catalogPrefix?: string) {
    // get all storage mappings because there is currently no resolver to get just one
    const { data, loading, error } = useStorageMappingsQuery(tenant);

    const storageMapping = useMemo(() => {
        if (!catalogPrefix) return null;
        return data.find((sm) => sm.catalogPrefix === catalogPrefix);
    }, [data, catalogPrefix]);

    return { storageMapping, loading, error };
}
