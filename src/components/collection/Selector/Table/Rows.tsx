import { TableCell, TableRow, useTheme } from '@mui/material';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'context/Theme';
import invariableStores from 'context/Zustand/invariableStores';

import { useStore } from 'zustand';

interface RowProps {
    isSelected: boolean;
    row: any;
    setRow: any;
}

interface RowsProps {
    data: any[];
}

function Row({ isSelected, row, setRow }: RowProps) {
    const theme = useTheme();

    return (
        <TableRow
            key={`collection-search-${row.id}`}
            selected={isSelected}
            onClick={() => setRow(row.id, row.catalog_name, !isSelected)}
            sx={getEntityTableRowSx(theme, false)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_name} />
            <TableCell>{row.catalog_name}</TableCell>
            <TimeStamp time={row.updated_at} />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    const [selected, setRow] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected, state.setSelected, state.disabledRows];
        }
    );

    return (
        <>
            {data.map((row) => (
                <Row
                    isSelected={selected.has(row.id)}
                    key={row.id}
                    row={row}
                    setRow={setRow}
                />
            ))}
        </>
    );
}

export default Rows;
