import { TableCell } from '@mui/material';

import DateFilter from 'components/filters/Date';

import { useTenantDetails } from 'context/fetcher/Tenant';
import { useZustandStore } from 'context/Zustand/provider';

import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

import { hasLength } from 'utils/misc-utils';

interface Props {
    header: string;
    selectableTableStoreName: SelectTableStoreNames;
}

const StatsHeader = ({ header, selectableTableStoreName }: Props) => {
    const tenantDetails = useTenantDetails();
    const hasStats = hasLength(tenantDetails);

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
                disabled={!hasStats || isValidating || queryCount === 0}
                selectableTableStoreName={selectableTableStoreName}
            />
        </TableCell>
    );
};

export default StatsHeader;
