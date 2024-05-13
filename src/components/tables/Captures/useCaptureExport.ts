import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import { useCallback, useMemo } from 'react';
import { Columns } from 'react-csv-downloader/dist/esm/lib/csv';
import { SelectTableStoreNames } from 'stores/names';
import { formatBytes, formatDocs } from '../cells/stats/shared';
import useRowsWithStatsState from '../hooks/useRowsWithStatsState';
import { ColumnNames } from '../shared';
import useExportColumns from '../useExportColumns';

function useCaptureExport(data: CollectionQueryWithStats[]) {
    const exportColumns = useExportColumns();

    const { stats } = useRowsWithStatsState(
        SelectTableStoreNames.COLLECTION,
        data
    );

    const columns = useMemo<Columns>(
        () => [
            exportColumns[ColumnNames.CatalogName],
            exportColumns[ColumnNames.DataWritten],
            exportColumns[ColumnNames.DocsWritten],
        ],
        [exportColumns]
    );

    const generateExport = useCallback(() => {
        return Promise.resolve(
            data.map((datum) => {
                return {
                    [ColumnNames.CatalogName]: datum.catalog_name,
                    [ColumnNames.DataWritten]: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_written_by_me
                    ),
                    [ColumnNames.DocsWritten]: formatDocs(
                        stats?.[datum.catalog_name]?.docs_written_by_me
                    ),
                };
            }) as any[]
        );
    }, [data, stats]);

    return {
        columns,
        generateExport,
    };
}

export default useCaptureExport;
