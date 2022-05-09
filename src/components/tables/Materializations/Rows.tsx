import { TableRow } from '@mui/material';
import Actions from 'components/tables/cells/Actions';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import { LiveSpecsExtQuery } from 'components/tables/Materializations';

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
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
    {
        field: 'last_pub_user_full_name',
        headerIntlKey: 'entityTable.data.lastPubUserFullName',
    },
    {
        field: null,
        headerIntlKey: null,
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

            <TimeStamp time={row.updated_at} />

            <UserName
                avatar={row.last_pub_user_avatar_url}
                email={row.last_pub_user_email}
                name={row.last_pub_user_full_name}
            />

            <Actions>
                <ExpandDetails disabled={true} />
            </Actions>
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
