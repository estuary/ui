import { useCallback, useMemo } from 'react';

import type { Columns } from 'react-csv-downloader/dist/esm/lib/csv';
import type { CollectionQueryWithStats } from 'src/api/liveSpecsExt';
import { SelectTableStoreNames } from 'src/stores/names';
import { hasLength } from 'src/utils/misc-utils';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import useRowsWithStatsState from 'src/components/tables/hooks/useRowsWithStatsState';
import { ColumnNames } from 'src/components/tables/shared';
import useExportColumns from 'src/components/tables/useExportColumns';


function useCollectionExport(data: CollectionQueryWithStats[]) {
    const exportColumns = useExportColumns();

    const { stats } = useRowsWithStatsState(
        SelectTableStoreNames.COLLECTION,
        data
    );

    const noData = useMemo(() => !hasLength(data), [data]);

    const columns = useMemo<Columns>(
        () => [
            exportColumns[ColumnNames.CatalogName],
            exportColumns[ColumnNames.DataWritten],
            exportColumns[ColumnNames.DataRead],
            exportColumns[ColumnNames.DocsWritten],
            exportColumns[ColumnNames.DocsRead],
        ],
        [exportColumns]
    );

    const generateExport = useCallback(() => {
        return Promise.resolve(
            data.map((datum) => {
                return {
                    [ColumnNames.CatalogName]: datum.catalog_name,
                    [ColumnNames.DataWritten]: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_written_to_me
                    ),
                    [ColumnNames.DataRead]: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_read_from_me
                    ),
                    [ColumnNames.DocsWritten]:
                        stats?.[datum.catalog_name]?.docs_written_to_me ?? 0,
                    [ColumnNames.DocsRead]:
                        stats?.[datum.catalog_name]?.docs_read_from_me ?? 0,
                };
            })
        );
    }, [data, stats]);

    return {
        columns,
        generateExport,
        noData,
    };
}

export default useCollectionExport;
