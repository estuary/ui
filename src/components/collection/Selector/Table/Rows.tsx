import { TableCell, TableRow, useTheme } from '@mui/material';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'context/Theme';
import invariableStores from 'context/Zustand/invariableStores';

import { useStore } from 'zustand';
import { catalogNameColumn, publishedColumn } from './shared';

interface RowProps {
    row: any;
    setRow: any;
}

interface RowsProps {
    data: any[];
}

function Row({ row, setRow }: RowProps) {
    const theme = useTheme();

    const disabled = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.disabledRows.includes(row[catalogNameColumn]);
        }
    );

    const isSelected = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.selected.has(row.id);
        }
    );

    return (
        <TableRow
            key={`collection-selector-table-${row.id}`}
            selected={isSelected}
            onClick={
                disabled ? undefined : () => setRow(row.id, row, !isSelected)
            }
            sx={getEntityTableRowSx(theme, disabled)}
        >
            <RowSelect
                disabled={disabled}
                isSelected={isSelected}
                name={row[catalogNameColumn]}
            />
            <TableCell
                sx={{
                    wordBreak: 'break-all',
                }}
            >
                {row[catalogNameColumn]}
            </TableCell>
            <TimeStamp time={row[publishedColumn]} />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    const setRow = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.setSelected;
        }
    );

    return (
        <>
            {data.map((row) => (
                <Row key={row.id} row={row} setRow={setRow} />
            ))}
        </>
    );
}

export default Rows;
