import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import { useCallback } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { formatBytes, formatDocs } from '../cells/stats/shared';
import useRowsWithStatsState from '../hooks/useRowsWithStatsState';

function useCollectionExport(data: CollectionQueryWithStats[]) {
    const { stats } = useRowsWithStatsState(
        SelectTableStoreNames.COLLECTION,
        data
    );

    return useCallback(() => {
        return Promise.resolve(
            data.map((datum) => {
                return {
                    name: datum.catalog_name,
                    datawritten: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_written_to_me
                    ),
                    dataRead: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_read_from_me
                    ),
                    docsWritten: formatDocs(
                        stats?.[datum.catalog_name]?.docs_written_to_me
                    ),
                    docsRead: formatDocs(
                        stats?.[datum.catalog_name]?.docs_read_from_me
                    ),
                };
            }) as any[]
        );
    }, [data, stats]);
}

export default useCollectionExport;
