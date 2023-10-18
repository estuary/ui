import { TableCell, TableRow, useTheme } from '@mui/material';
import ChipListCell from 'components/tables/cells/ChipList';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import {
    PrefixPreference,
    PrefixPreferenceDictionary,
} from 'utils/notification-utils';

interface RowsProps {
    data: PrefixPreferenceDictionary;
}

interface RowProps {
    row: [string, PrefixPreference];
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

    const prefix = row[0];
    const data = row[1];

    return (
        <TableRow
            hover
            onClick={() => handlers.clickRow(prefix)}
            selected={isSelected}
            sx={getEntityTableRowSx(theme)}
        >
            <RowSelect isSelected={isSelected} name={prefix} />

            <TableCell>{prefix}</TableCell>

            <ChipListCell
                values={data.userPreferences.map(({ email }) => email)}
                stripPath={false}
            />

            <TimeStamp time={data.lastUpdated} enableRelative />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    // Select Table Store
    const selectTableStoreName = SelectTableStoreNames.PREFIX_ALERTS;

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
            {Object.entries(data).map((row) => (
                <Row
                    key={row[0]}
                    row={row}
                    isSelected={selected.has(row[0])}
                    setRow={setRow}
                />
            ))}
        </>
    );
}

export default Rows;
