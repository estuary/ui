import type { MaterializationQueryWithStats } from 'src/api/liveSpecsExt';
import type { StatsResponse } from 'src/stores/Tables/Store';

import { TableRow, useTheme } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import Connector from 'src/components/tables/cells/Connector';
import EditTask from 'src/components/tables/cells/EditTask';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import RelatedCollectionsCell from 'src/components/tables/cells/RelatedCollectionsCell';
import RowSelect from 'src/components/tables/cells/RowSelect';
import Bytes from 'src/components/tables/cells/stats/Bytes';
import Docs from 'src/components/tables/cells/stats/Docs';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import useRowsWithStatsState from 'src/components/tables/hooks/useRowsWithStatsState';
import { useEntityType } from 'src/context/EntityContext';
import { getEntityTableRowSx } from 'src/context/Theme';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { SelectTableStoreNames } from 'src/stores/names';

interface RowsProps {
    data: MaterializationQueryWithStats[];
    showEntityStatus: boolean;
}

interface RowProps {
    stats?: StatsResponse;
    statsFailed?: boolean;
    row: MaterializationQueryWithStats;
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
        authenticatedRoutes.materializations.details.overview.fullPath
    );

    const handlers = {
        clickRow: (rowId: string, lastPubId: string) => {
            setRow(rowId, lastPubId, !isSelected);
        },
    };

    return (
        <TableRow
            hover
            onClick={() => handlers.clickRow(row.id, row.last_pub_id)}
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
                read
                failed={statsFailed}
                val={stats ? stats[row.catalog_name]?.bytes_read_by_me : null}
            />

            <Docs
                read
                failed={statsFailed}
                val={stats ? stats[row.catalog_name]?.docs_read_by_me : null}
            />

            <RelatedCollectionsCell values={row.reads_from} />

            <TimeStamp time={row.updated_at} />

            <EditTask name={row.catalog_name} liveSpecId={row.id} />
        </TableRow>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const { stats, selected, setRow, statsFailed } = useRowsWithStatsState(
        SelectTableStoreNames.MATERIALIZATION,
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
