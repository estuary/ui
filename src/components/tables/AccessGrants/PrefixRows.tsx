import { TableCell, TableRow } from '@mui/material';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { useZustandStore } from 'context/Zustand/provider';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import RowSelect from '../cells/RowSelect';

interface RowProps {
    row: any;
    selected: boolean;
    setSelected: SelectableTableStore['setSelected'];
}

interface RowsProps {
    data: any[];
}

const selectTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;

export const prefixTableColumns = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'object_role',
        headerIntlKey: 'entityTable.data.sharedPrefix',
    },
    {
        field: 'subject_role',
        headerIntlKey: 'entityTable.data.sharedWith',
    },
    {
        field: 'capability',
        headerIntlKey: 'entityTable.data.capability',
    },
    {
        field: 'detail',
        headerIntlKey: 'entityTable.data.detail',
    },
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

            <TableCell>{row.object_role}</TableCell>

            {row.subject_role ? (
                <TableCell>{row.subject_role}</TableCell>
            ) : (
                <TableCell> </TableCell>
            )}

            <TableCell>{row.capability}</TableCell>

            <TableCell>{row.detail}</TableCell>

            <TimeStamp time={row.updated_at} enableRelative />
        </TableRow>
    );
}

function PrefixRows({ data }: RowsProps) {
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
                return (
                    <Row
                        key={row.id}
                        row={row}
                        selected={selected.has(row.id)}
                        setSelected={setSelected}
                    />
                );
            })}
        </>
    );
}

export default PrefixRows;
