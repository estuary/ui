import { Box, Button, TableCell, TableRow } from '@mui/material';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import { LiveSpecsExtQuery } from 'components/tables/Materializations';
import { FormattedMessage } from 'react-intl';

interface RowsProps {
    data: LiveSpecsExtQuery[];
}

interface RowProps {
    row: LiveSpecsExtQuery;
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: null,
        headerIntlKey: 'data.type',
    },
    {
        field: 'reads_from',
        headerIntlKey: 'entityTable.data.readsFrom',
    },
    {
        field: 'last_pub_user_full_name',
        headerIntlKey: 'entityTable.data.lastPubUserFullName',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
    },
];

function Row({ row }: RowProps) {
    return (
        <TableRow key={`Entity-${row.id}`}>
            <EntityName name={row.catalog_name} />

            <Connector
                openGraph={row.connector_open_graph}
                imageTag={`${row.connector_image_name}${row.connector_image_tag}`}
            />

            <ChipList strings={row.reads_from} />

            <UserName
                avatar={row.last_pub_user_avatar_url}
                name={row.last_pub_user_full_name}
            />

            <TimeStamp time={row.updated_at} />

            <TableCell>
                <Box
                    sx={{
                        display: 'flex',
                    }}
                >
                    <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        sx={{ mr: 1 }}
                        disabled
                    >
                        <FormattedMessage id="cta.details" />
                    </Button>
                </Box>
            </TableCell>
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row row={row} key={row.id} />
            ))}
        </>
    );
}

export default Rows;
