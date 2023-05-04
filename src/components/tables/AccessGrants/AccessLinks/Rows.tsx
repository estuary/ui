import { TableCell, TableRow, Typography } from '@mui/material';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import TruncatedToken from 'components/tables/cells/TruncatedToken';
import { useZustandStore } from 'context/Zustand/provider';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { GrantDirective_AccessLinks } from 'types';

interface RowsProps {
    data: GrantDirective_AccessLinks[];
}

interface RowProps {
    row: GrantDirective_AccessLinks;
    isSelected: boolean;
    setRow: SelectableTableStore['setSelected'];
}

const selectTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

function Row({ row, isSelected, setRow }: RowProps) {
    const selectRow = (rowId: string, token: string): void => {
        setRow(rowId, token, !isSelected);
    };

    return (
        <TableRow
            hover
            selected={isSelected}
            onClick={() => selectRow(row.id, row.token)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_prefix} />

            <TableCell>
                <Typography>{row.catalog_prefix}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.spec.grantedPrefix}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.spec.capability}</Typography>
            </TableCell>

            <TruncatedToken token={row.token} />

            <TimeStamp time={row.updated_at} />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
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
                    row={row}
                    key={row.id}
                    isSelected={selected.has(row.id)}
                    setRow={setRow}
                />
            ))}
        </>
    );
}

export default Rows;
