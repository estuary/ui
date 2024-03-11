import { useMemo } from 'react';
import { DEFAULT_FILTER } from 'services/supabase';
import { ShardEntityTypes } from 'stores/ShardDetail/types';
import { hasLength } from 'utils/misc-utils';

// This will expand eventually. Federated data planes will need to write logs to
//      different regions. This is why this is in an array and takes some kind of "region selector".
const REGIONS = [`us-central1`];

function useJournalNameForLogs(
    entityName: string,
    entityType: ShardEntityTypes[],
    region: number = 0
) {
    return useMemo(() => {
        const collectionName = `ops.${REGIONS[region]}.v1/logs`;
        return [
            !hasLength(entityType)
                ? ''
                : `${collectionName}/kind=${
                      entityType[0] ?? DEFAULT_FILTER
                  }/name=${encodeURIComponent(entityName)}/pivot=00`,
            entityName,
        ];
    }, [entityName, entityType, region]);
}

export default useJournalNameForLogs;
