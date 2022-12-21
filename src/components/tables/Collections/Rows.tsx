import { TableRow, useTheme } from '@mui/material';
import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import Actions from 'components/tables/cells/Actions';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import TimeStamp from 'components/tables/cells/TimeStamp';
import DetailsPanel from 'components/tables/Details/DetailsPanel';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { useMemo, useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { hasLength } from 'utils/misc-utils';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
    StatsResponse,
} from '../Store';
import useCollectionColumns from './useCollectionColumns';

interface RowProps {
    stats?: StatsResponse;
    row: CollectionQueryWithStats;
    showEntityStatus: boolean;
}

interface RowsProps {
    data: CollectionQueryWithStats[];
    showEntityStatus: boolean;
}

function Row({ row, stats, showEntityStatus }: RowProps) {
    const theme = useTheme();
    const tenantDetails = useTenantDetails();
    const tableColumns = useCollectionColumns();

    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const calculatedBytes = useMemo(() => {
        if (stats) {
            return (
                (stats[row.catalog_name]?.bytes_written_by_me ?? 0) +
                (stats[row.catalog_name]?.bytes_written_to_me ?? 0)
            );
        } else {
            return 0;
        }
    }, [row.catalog_name, stats]);

    const calculatedDocs = useMemo(() => {
        if (stats) {
            return (
                (stats[row.catalog_name]?.docs_written_by_me ?? 0) +
                (stats[row.catalog_name]?.docs_written_to_me ?? 0)
            );
        } else {
            return 0;
        }
    }, [row.catalog_name, stats]);

    return (
        <>
            <TableRow
                key={`Entity-${row.id}`}
                sx={getEntityTableRowSx(theme, detailsExpanded)}
            >
                <EntityName
                    name={row.catalog_name}
                    showEntityStatus={showEntityStatus}
                />

                {hasLength(tenantDetails) ? (
                    <>
                        <Bytes val={stats ? calculatedBytes : null} />

                        <Docs val={stats ? calculatedDocs : null} />
                    </>
                ) : null}

                <TimeStamp time={row.updated_at} />

                <Actions>
                    <ExpandDetails
                        onClick={() => {
                            setDetailsExpanded(!detailsExpanded);
                        }}
                        expanded={detailsExpanded}
                    />
                </Actions>
            </TableRow>

            <DetailsPanel
                detailsExpanded={detailsExpanded}
                lastPubId={row.last_pub_id}
                colSpan={tableColumns.length + 1}
                entityType="collection"
                entityName={row.catalog_name}
                disableLogs
            />
        </>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const selectTableStoreName = SelectTableStoreNames.COLLECTION;

    const stats = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['stats']
    >(selectTableStoreName, selectableTableStoreSelectors.stats.get);

    return (
        <>
            {data.map((row) => (
                <Row
                    stats={stats}
                    row={row}
                    showEntityStatus={showEntityStatus}
                    key={row.id}
                />
            ))}
        </>
    );
}

export default Rows;
