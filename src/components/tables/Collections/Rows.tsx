import { TableCell, TableRow } from '@mui/material';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import DetailsAction from 'components/tables/cells/DetailsAction';
import EntityName from 'components/tables/cells/EntityName';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';

interface Props {
    data: LiveSpecsExtQuery[];
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: 'spec_type',
        headerIntlKey: 'entityTable.data.connectorType',
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
        headerIntlKey: 'entityTable.data.actions',
    },
];

function Rows({ data }: Props) {
    return (
        <>
            {data.map((row) => (
                <TableRow key={`Entity-${row.id}`}>
                    <EntityName name={row.catalog_name} />

                    <TableCell sx={{ minWidth: 100 }}>
                        {row.spec_type}
                    </TableCell>

                    <TimeStamp time={row.updated_at} />

                    <UserName
                        avatar={row.last_pub_user_avatar_url}
                        name={row.last_pub_user_full_name}
                    />

                    <DetailsAction disabled={true} />
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
