import { TableCell, TableRow, useTheme } from '@mui/material';
import { AlertMethodQuery } from 'api/alerts';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';

interface RowsProps {
    data: AlertMethodQuery[];
}

interface RowProps {
    row: AlertMethodQuery;
    isSelected: boolean;
    setRow: any;
}

function Row({ row, isSelected, setRow }: RowProps) {
    const theme = useTheme();

    const handlers = {
        clickRow: (rowId: string) => {
            setRow(rowId, rowId, !isSelected);
        },
    };

    return (
        <TableRow
            hover
            onClick={() => handlers.clickRow(row.id)}
            selected={isSelected}
            sx={getEntityTableRowSx(theme)}
        >
            <RowSelect isSelected={isSelected} name={row.prefix} />

            <TableCell>{row.prefix}</TableCell>

            <TableCell>{row.email}</TableCell>

            <TimeStamp time={row.updated_at} enableRelative />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    // Select Table Store
    const selectTableStoreName = SelectTableStoreNames.MATERIALIZATION;

    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.get);

    const setRow = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setSelected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.set);

    return (
        <>
            {data.map((row) => (
                <Row
                    key={row.id}
                    row={row}
                    isSelected={selected.has(row.id)}
                    setRow={setRow}
                />
            ))}
        </>
    );
}

export default Rows;
