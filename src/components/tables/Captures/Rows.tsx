import { TableRow, useTheme } from '@mui/material';
import { CaptureQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import Connector from 'components/tables/cells/Connector';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { useEntityType } from 'context/EntityContext';
import { getEntityTableRowSx } from 'context/Theme';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { StatsResponse } from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import EditTask from '../cells/EditTask';
import EntityNameLink from '../cells/EntityNameLink';
import RelatedCollectionsCell from '../cells/RelatedCollectionsCell';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';
import useRowsWithStatsState from '../hooks/useRowsWithStatsState';
import { selectKeyValueName } from '../shared';

interface RowsProps {
    data: CaptureQueryWithStats[];
    showEntityStatus: boolean;
}

export interface RowProps {
    stats?: StatsResponse;
    row: CaptureQueryWithStats;
    setRow: any;
    isSelected: boolean;
    showEntityStatus: boolean;
}

function Row({ isSelected, setRow, row, stats, showEntityStatus }: RowProps) {
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
                val={
                    stats ? stats[row.catalog_name]?.bytes_written_by_me : null
                }
            />

            <Docs
                val={stats ? stats[row.catalog_name]?.docs_written_by_me : null}
            />

            <RelatedCollectionsCell values={row.writes_to} />

            <TimeStamp time={row.updated_at} />

            <EditTask name={row.catalog_name} liveSpecId={row.id} />
        </TableRow>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const { stats, selected, setRow } = useRowsWithStatsState(
        SelectTableStoreNames.CAPTURE,
        data
    );

    return (
        <>
            {data.map((row) => (
                <Row
                    stats={stats}
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
