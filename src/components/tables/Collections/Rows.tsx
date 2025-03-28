import { TableRow, useTheme } from '@mui/material';


import type { CollectionQueryWithStats } from 'src/api/liveSpecsExt';
import { authenticatedRoutes } from 'src/app/routes';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { useEntityType } from 'src/context/EntityContext';
import { getEntityTableRowSx } from 'src/context/Theme';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { SelectTableStoreNames } from 'src/stores/names';
import type { StatsResponse } from 'src/stores/Tables/Store';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import Docs from 'src/components/tables/cells/stats/Docs';
import Bytes from 'src/components/tables/cells/stats/Bytes';
import { selectKeyValueName } from 'src/components/tables/shared';
import useRowsWithStatsState from 'src/components/tables/hooks/useRowsWithStatsState';
import RowSelect from 'src/components/tables/cells/RowSelect';

interface RowProps {
    isSelected: boolean;
    row: CollectionQueryWithStats;
    setRow: any;
    showEntityStatus: boolean;
    stats?: StatsResponse;
    statsFailed?: boolean;
}

interface RowsProps {
    data: CollectionQueryWithStats[];
    showEntityStatus: boolean;
}

function Row({
    isSelected,
    setRow,
    row,
    stats,
    statsFailed,
    showEntityStatus,
}: RowProps) {
    const theme = useTheme();
    const entityType = useEntityType();

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.collections.details.overview.fullPath
    );

    return (
        <TableRow
            key={`Entity-${row.id}`}
            selected={isSelected}
            onClick={() => setRow(row.id, row[selectKeyValueName], !isSelected)}
            sx={getEntityTableRowSx(theme)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_name} />

            <EntityNameLink
                name={row.catalog_name}
                showEntityStatus={showEntityStatus}
                detailsLink={generatePath(row)}
                entityStatusTypes={[entityType, 'derivation']}
            />

            <Bytes
                failed={statsFailed}
                val={
                    stats ? stats[row.catalog_name]?.bytes_written_to_me : null
                }
            />

            <Bytes
                read
                failed={statsFailed}
                val={stats ? stats[row.catalog_name]?.bytes_read_from_me : null}
            />

            <Docs
                failed={statsFailed}
                val={stats ? stats[row.catalog_name]?.docs_written_to_me : null}
            />

            <Docs
                read
                failed={statsFailed}
                val={stats ? stats[row.catalog_name]?.docs_read_from_me : null}
            />

            <TimeStamp time={row.updated_at} />

            {/*            <MaterializeCollection
                liveSpecId={row.id}
                name={row.catalog_name}
            />*/}
        </TableRow>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const { stats, selected, setRow, statsFailed } = useRowsWithStatsState(
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
                    statsFailed={statsFailed}
                />
            ))}
        </>
    );
}

export default Rows;
