import { TableCell, TableRow } from '@mui/material';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';

interface RowProps {
    row: any;
}

interface RowsProps {
    data: any[];
    showUser?: boolean;
}

export const userTableColumns = [
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

export const prefixTableColumns = [
    {
        field: 'subject_role',
        headerIntlKey: 'entityTable.data.sharedEntity',
    },
    {
        field: 'capability',
        headerIntlKey: 'entityTable.data.capability',
    },
    {
        field: 'object_role',
        headerIntlKey: 'entityTable.data.sharedWith',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];

function Row({ row }: RowProps) {
    return (
        <TableRow key={`Entity-${row.id}`}>
            {row.user_full_name ? (
                <UserName
                    name={row.user_full_name}
                    avatar={row.user_avatar_url}
                    email={row.user_email}
                />
            ) : row.user_email ? (
                <TableCell>{row.user_email}</TableCell>
            ) : row.subject_role ? (
                <TableCell>{row.subject_role}</TableCell>
            ) : (
                <TableCell> </TableCell>
            )}

            <TableCell>{row.capability}</TableCell>

            <TableCell>{row.object_role}</TableCell>

            <TimeStamp time={row.updated_at} enableRelative />
        </TableRow>
    );
}

function Rows({ data, showUser }: RowsProps) {
    return (
        <>
            {data.map((row) => {
                const isUser = row.user_full_name || row.user_email;
                if (showUser) {
                    if (isUser) {
                        return <Row row={row} key={row.id} />;
                    } else {
                        return null;
                    }
                } else if (isUser) {
                    return null;
                } else {
                    return <Row row={row} key={row.id} />;
                }
            })}
        </>
    );
}

export default Rows;
