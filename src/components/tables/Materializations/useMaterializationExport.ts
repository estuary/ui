import { useCallback, useMemo } from 'react';

import { formatBytes } from '../cells/stats/shared';
import useRowsWithStatsState from '../hooks/useRowsWithStatsState';
import { ColumnNames } from '../shared';
import useExportColumns from '../useExportColumns';
import { Columns } from 'react-csv-downloader/dist/esm/lib/csv';

import { MaterializationQueryWithStats } from 'src/api/liveSpecsExt';
import { SelectTableStoreNames } from 'src/stores/names';
import { hasLength } from 'src/utils/misc-utils';

function useMaterializationExport(data: MaterializationQueryWithStats[]) {
    const exportColumns = useExportColumns();
    const { stats } = useRowsWithStatsState(
        SelectTableStoreNames.MATERIALIZATION,
        data
    );

    const noData = useMemo(() => !hasLength(data), [data]);

    const columns = useMemo<Columns>(
        () => [
            exportColumns[ColumnNames.CatalogName],
            exportColumns[ColumnNames.DataRead],
            exportColumns[ColumnNames.DocsRead],
        ],
        [exportColumns]
    );

    const generateExport = useCallback(() => {
        return Promise.resolve(
            data.map((datum) => {
                return {
                    [ColumnNames.CatalogName]: datum.catalog_name,
                    [ColumnNames.DataRead]: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_read_by_me
                    ),
                    [ColumnNames.DocsRead]:
                        stats?.[datum.catalog_name]?.docs_read_by_me ?? 0,
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

export default useMaterializationExport;
