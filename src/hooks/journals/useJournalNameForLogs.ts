import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';

// This will expand eventually. Federated data planes will need to write logs to
//      different regions. This is why this is in an array and takes some kind of "region selector".
const REGIONS = [`us-central1`];

function useJournalNameForLogs(entityName: string, region: number = 0) {
    const entityType = useEntityType();

    return useMemo(() => {
        const collectionName = `ops.${REGIONS[region]}.v1/logs`;

        return [
            `${collectionName}/kind=${entityType}/name=${encodeURIComponent(
                entityName
            )}/pivot=00`,
            collectionName,
        ];
    }, [entityName, entityType, region]);
}

export default useJournalNameForLogs;
