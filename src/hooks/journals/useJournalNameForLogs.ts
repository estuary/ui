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
        const selector = `estuary.dev/collection=ops.${
            REGIONS[region]
        }.v1/logs,estuary.dev/field/name=${entityName}/kind=${
            entityType[0] ?? DEFAULT_FILTER
        }/pivot=00`;
        // const selector = `estuary.dev/collection=ops.${REGIONS[region]}.v1/logs,estuary.dev/field/name=${entityName}`;

        return [!hasLength(entityType) ? '' : selector, entityName];
    }, [entityName, entityType, region]);
}

export default useJournalNameForLogs;
