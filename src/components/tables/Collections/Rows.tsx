import { TableRow, useTheme } from '@mui/material';
import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import Actions from 'components/tables/cells/Actions';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import TimeStamp from 'components/tables/cells/TimeStamp';
import DetailsPanel from 'components/tables/Details/DetailsPanel';
import { getEntityTableRowSx } from 'context/Theme';
import { useState } from 'react';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';

interface RowProps {
    row: CollectionQueryWithStats;
    showEntityStatus: boolean;
}

interface RowsProps {
    data: CollectionQueryWithStats[];
    showEntityStatus: boolean;
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.stats.bytes_written_to_me',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.stats.docs_written_to_me',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
    {
        field: null,
        headerIntlKey: null,
    },
];

function Row({ row, showEntityStatus }: RowProps) {
    const theme = useTheme();

    const [detailsExpanded, setDetailsExpanded] = useState(false);

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

                <Bytes
                    val={
                        row.stats
                            ? row.stats.bytes_written_by_me +
                              row.stats.bytes_written_to_me
                            : 0
                    }
                />

                <Docs
                    val={
                        row.stats
                            ? row.stats.docs_written_by_me +
                              row.stats.docs_written_to_me
                            : 0
                    }
                />

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
                colSpan={tableColumns.length}
                entityType="collection"
                entityName={row.catalog_name}
                disableLogs
            />
        </>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row
                    row={row}
                    showEntityStatus={showEntityStatus}
                    key={row.id}
                />
            ))}
        </>
    );
}

export default Rows;
