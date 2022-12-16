import { TableCell } from '@mui/material';
import DateFilter from 'components/tables/Filters/Date';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { useZustandStore } from 'context/Zustand/provider';
import { SelectTableStoreNames } from 'stores/names';

interface Props {
    header: string;
    selectableTableStoreName: SelectTableStoreNames;
}

const StatsHeader = ({ header, selectableTableStoreName }: Props) => {
    const isValidating = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['loading']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.loading);

    const queryCount = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['count']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.count);

    return (
        <TableCell colSpan={2}>
            <DateFilter
                header={header}
                disabled={isValidating || queryCount === 0}
                selectableTableStoreName={selectableTableStoreName}
            />
        </TableCell>
    );
};

export default StatsHeader;
