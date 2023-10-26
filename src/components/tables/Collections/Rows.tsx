import { TableRow, useTheme } from '@mui/material';
import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { useEntityType } from 'context/EntityContext';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { getEntityTableRowSx } from 'context/Theme';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';

import { StatsResponse } from 'stores/Tables/Store';
import { hasLength } from 'utils/misc-utils';
import EntityNameLink from '../cells/EntityNameLink';
import MaterializeCollection from '../cells/MaterializeCollection';
import RowSelect from '../cells/RowSelect';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';
import useRowsWithStatsState from '../hooks/useRowsWithStatsState';

interface RowProps {
    isSelected: boolean;
    row: CollectionQueryWithStats;
    setRow: any;
    showEntityStatus: boolean;
    stats?: StatsResponse;
}

interface RowsProps {
    data: CollectionQueryWithStats[];
    showEntityStatus: boolean;
}

function Row({ isSelected, setRow, row, stats, showEntityStatus }: RowProps) {
    const theme = useTheme();
    const tenantDetails = useTenantDetails();
    const entityType = useEntityType();

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.collections.details.overview.fullPath
    );

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
        <TableRow
            key={`Entity-${row.id}`}
            selected={isSelected}
            onClick={() => setRow(row.id, row.last_pub_id, !isSelected)}
            sx={getEntityTableRowSx(theme)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_name} />

            <EntityNameLink
                name={row.catalog_name}
                showEntityStatus={showEntityStatus}
                detailsLink={generatePath(row)}
                entityStatusTypes={[entityType, 'derivation']}
            />

            {hasLength(tenantDetails) ? (
                <>
                    <Bytes val={stats ? calculatedBytes : null} />

                    <Docs val={stats ? calculatedDocs : null} />
                </>
            ) : null}

            <TimeStamp time={row.updated_at} />

            <MaterializeCollection
                liveSpecId={row.id}
                name={row.catalog_name}
            />
        </TableRow>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const { stats, selected, setRow } = useRowsWithStatsState(
        SelectTableStoreNames.COLLECTION,
        data
    );

    return (
        <>
            {data.map((row) => (
                <Row
                    isSelected={selected.has(row.id)}
                    key={row.id}
                    row={row}
                    setRow={setRow}
                    showEntityStatus={showEntityStatus}
                    stats={stats}
                />
            ))}
        </>
    );
}

export default Rows;
