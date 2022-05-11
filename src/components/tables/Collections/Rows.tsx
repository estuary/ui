import { TableCell, TableRow } from '@mui/material';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import Actions from 'components/tables/cells/Actions';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import { tableBorderSx } from 'context/Theme';

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
        headerIntlKey: null,
    },
];

function Rows({ data }: Props) {
    return (
        <>
            {data.map((row) => (
                <TableRow key={`Entity-${row.id}`}>
                    <EntityName name={row.catalog_name} />

                    <TableCell sx={{ minWidth: 100, ...tableBorderSx }}>
                        {row.spec_type}
                    </TableCell>

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
            ))}
        </>
    );
}

export default Rows;
