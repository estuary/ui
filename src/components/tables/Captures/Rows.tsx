import { TableRow, useTheme } from '@mui/material';


import type { CaptureQueryWithStats } from 'src/api/liveSpecsExt';
import { authenticatedRoutes } from 'src/app/routes';
import Connector from 'src/components/tables/cells/Connector';
import RowSelect from 'src/components/tables/cells/RowSelect';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { useEntityType } from 'src/context/EntityContext';
import { getEntityTableRowSx } from 'src/context/Theme';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { SelectTableStoreNames } from 'src/stores/names';
import type { StatsResponse } from 'src/stores/Tables/Store';
import EditTask from 'src/components/tables/cells/EditTask';
import Bytes from 'src/components/tables/cells/stats/Bytes';
import RelatedCollectionsCell from 'src/components/tables/cells/RelatedCollectionsCell';
import useRowsWithStatsState from 'src/components/tables/hooks/useRowsWithStatsState';
import Docs from 'src/components/tables/cells/stats/Docs';
import { selectKeyValueName } from 'src/components/tables/shared';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';

interface RowsProps {
    data: CaptureQueryWithStats[];
    showEntityStatus: boolean;
}

export interface RowProps {
    stats?: StatsResponse;
    statsFailed?: boolean;
    row: CaptureQueryWithStats;
    setRow: any;
    isSelected: boolean;
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
        authenticatedRoutes.captures.details.overview.fullPath
    );

    return (
        <TableRow
            hover
            onClick={() => setRow(row.id, row[selectKeyValueName], !isSelected)}
            selected={isSelected}
            sx={getEntityTableRowSx(theme)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_name} />

            <EntityNameLink
                name={row.catalog_name}
                showEntityStatus={showEntityStatus}
                detailsLink={generatePath(row)}
                entityStatusTypes={[entityType]}
            />

            <Connector
                connectorImage={row.image}
                connectorName={row.title}
                imageTag={`${row.connector_image_name}${row.connector_image_tag}`}
            />

            <Bytes
                failed={statsFailed}
                val={
                    stats ? stats[row.catalog_name]?.bytes_written_by_me : null
                }
            />

            <Docs
                failed={statsFailed}
                val={stats ? stats[row.catalog_name]?.docs_written_by_me : null}
            />

            <RelatedCollectionsCell values={row.writes_to} />

            <TimeStamp time={row.updated_at} />

            <EditTask name={row.catalog_name} liveSpecId={row.id} />
        </TableRow>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const { stats, selected, setRow, statsFailed } = useRowsWithStatsState(
        SelectTableStoreNames.CAPTURE,
        data
    );

    return (
        <>
            {data.map((row) => (
                <Row
                    stats={stats}
                    statsFailed={statsFailed}
                    row={row}
                    key={row.id}
                    isSelected={selected.has(row.id)}
                    setRow={setRow}
                    showEntityStatus={showEntityStatus}
                />
            ))}
        </>
    );
}

export default Rows;
