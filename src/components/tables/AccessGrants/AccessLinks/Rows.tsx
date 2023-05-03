import { Button, TableCell, TableRow, Typography } from '@mui/material';
import TimeStamp from 'components/tables/cells/TimeStamp';
import TruncatedToken from 'components/tables/cells/TruncatedToken';
import { useZustandStore } from 'context/Zustand/provider';
import { FormattedMessage } from 'react-intl';
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
    setRow: any;
    isSelected: boolean;
}

const selectTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

function Row({ row }: RowProps) {
    return (
        <TableRow hover>
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

            <TableCell>
                <Button size="small">
                    <FormattedMessage id="cta.delete" />
                </Button>
            </TableCell>
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
