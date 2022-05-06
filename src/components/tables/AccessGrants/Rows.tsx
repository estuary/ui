import { TableCell, TableRow } from '@mui/material';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';

interface Props {
    data: any[];
}

export const tableColumns = [
    {
        field: 'user_full_name',
        headerIntlKey: 'entityTable.data.userFullName',
    },
    {
        field: 'capability',
        headerIntlKey: 'entityTable.data.capability',
    },
    {
        field: 'object_role',
        headerIntlKey: 'entityTable.data.objectRole',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];

function Rows({ data }: Props) {
    return (
        <>
            {data.map((row) => (
                <TableRow key={`Entity-${row.id}`}>
                    {row.user_full_name ? (
                        <UserName
                            name={row.user_full_name}
                            avatar={row.user_avatar_url}
                            email={row.user_email}
                        />
                    ) : (
                        <TableCell>{row.subject_role}</TableCell>
                    )}

                    <TableCell>{row.capability}</TableCell>

                    <TableCell>{row.object_role}</TableCell>

                    <TimeStamp time={row.updated_at} enableRelative />
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
