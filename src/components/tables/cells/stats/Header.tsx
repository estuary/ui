import { TableCell, Typography } from '@mui/material';
import DateFilter from 'components/filters/Date';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { useZustandStore } from 'context/Zustand/provider';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { hasLength } from 'utils/misc-utils';

interface Props {
    selectableTableStoreName: SelectTableStoreNames;
    header?: string;
}

const StatsHeader = ({ header, selectableTableStoreName }: Props) => {
    const tenantDetails = useTenantDetails();
    const hasStats = hasLength(tenantDetails);

    const isValidating = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['loading']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.loading);

    const networkFailed = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['networkFailed']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.query.networkFailed
    );

    const queryCount = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['count']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.count);

    return (
        <>
            <TableCell>
                <Typography
                    component="span"
                    sx={{ mt: 0.5, fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                    <FormattedMessage
                        id="data.written"
                        values={{
                            type: (
                                <FormattedMessage id={header ?? 'data.data'} />
                            ),
                        }}
                    />
                </Typography>
            </TableCell>
            <TableCell>
                <DateFilter
                    header={header ?? 'data.docs'}
                    disabled={
                        !hasStats ||
                        isValidating ||
                        networkFailed ||
                        queryCount === 0
                    }
                    selectableTableStoreName={selectableTableStoreName}
                />
            </TableCell>
        </>
    );
};

export default StatsHeader;
