import { TableCell, TableRow, useTheme } from '@mui/material';
import RowSelect from 'components/tables/cells/RowSelect';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

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
            onClick={() => setRow(row.id, row.last_pub_id, !isSelected)}
            sx={getEntityTableRowSx(theme, false)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_name} />
            <TableCell>{row.catalog_name}</TableCell>
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    const selectTableStoreName = SelectTableStoreNames.COLLECTION_SELECTOR;

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
