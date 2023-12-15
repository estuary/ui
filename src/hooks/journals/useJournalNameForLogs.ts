import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';

const REGIONS = [`ops.us-central1.v1`];

function useJournalNameForLogs(entityName: string, region: number = 0) {
    const entityType = useEntityType();

    return useMemo(() => {
        const collectionName = `${REGIONS[region]}/logs`;

        return [
            `${collectionName}/kind=${entityType}/name=${encodeURIComponent(
                entityName
            )}/pivot=00`,
            collectionName,
        ];
    }, [entityName, entityType, region]);
}

export default useJournalNameForLogs;
