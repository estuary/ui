import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { TableCell, TableRow } from '@mui/material';

import RowSelect from 'src/components/tables/cells/RowSelect';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import UserName from 'src/components/tables/cells/UserName';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

interface RowProps {
    row: any;
    selected: boolean;
    setSelected: SelectableTableStore['setSelected'];
}

interface RowsProps {
    data: any[];
}

const selectTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_USERS;

export const userTableColumns = [
    {
        field: null,
        headerIntlKey: '',
    },
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
    // This basically only ever said "applied via directive" so hiding for now
    // {
    //     field: 'detail',
    //     headerIntlKey: 'entityTable.data.detail',
    // },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];

function Row({ row, selected, setSelected }: RowProps) {
    return (
        <TableRow
            key={`Entity-${row.id}`}
            onClick={() => setSelected(row.id, row, !selected)}
            selected={selected}
        >
            <RowSelect
                isSelected={selected}
                name={row.user_full_name ?? row.subject_role}
            />

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

            {/*<TableCell>{row.detail}</TableCell>*/}

            <TimeStamp time={row.updated_at} enableRelative />
        </TableRow>
    );
}

function UserRows({ data }: RowsProps) {
    const setSelected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setSelected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.set);

    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.get);

    return (
        <>
            {data.map((row) => {
                const isUser = row.user_full_name || row.user_email;

                return isUser ? (
                    <Row
                        key={row.id}
                        row={row}
                        selected={selected.has(row.id)}
                        setSelected={setSelected}
                    />
                ) : null;
            })}
        </>
    );
}

export default UserRows;
