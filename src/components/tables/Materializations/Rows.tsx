import { TableRow, useTheme } from '@mui/material';
import type { MaterializationQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import Connector from 'components/tables/cells/Connector';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { useEntityType } from 'context/EntityContext';
import { getEntityTableRowSx } from 'context/Theme';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { SelectTableStoreNames } from 'stores/names';
import type { StatsResponse } from 'stores/Tables/Store';
import EditTask from '../cells/EditTask';
import EntityNameLink from '../cells/EntityNameLink';
import RelatedCollectionsCell from '../cells/RelatedCollectionsCell';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';
import useRowsWithStatsState from '../hooks/useRowsWithStatsState';

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
