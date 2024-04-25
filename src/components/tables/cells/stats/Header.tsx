import { TableCell, Typography } from '@mui/material';
import DateFilter from 'components/filters/Date';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { useZustandStore } from 'context/Zustand/provider';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { hasLength } from 'utils/misc-utils';

interface Props {
    selectableTableStoreName: SelectTableStoreNames;
    header?: string;
    hideFilter?: boolean;
    headerSuffix?: 'data.written' | 'data.read';
}

const StatsHeader = ({
    selectableTableStoreName,
    header,
    hideFilter,
    headerSuffix,
}: Props) => {
    const intl = useIntl();
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

    const [firstColHeader, secondColHeader] = useMemo(() => {
        return [
            intl.formatMessage(
                {
                    id: headerSuffix ? headerSuffix : 'data.written',
                },
                {
                    type: intl.formatMessage({
                        id: header ?? 'data.data',
                    }),
                }
            ),
            intl.formatMessage(
                {
                    id: headerSuffix ? headerSuffix : 'data.read',
                },
                {
                    type: intl.formatMessage({
                        id: header ?? 'data.docs',
                    }),
                }
            ),
        ];
    }, [header, headerSuffix, intl]);

    return (
        <>
            <TableCell>
                <Typography
                    component="span"
                    sx={{ mt: 0.5, fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                    {firstColHeader}
                </Typography>
            </TableCell>
            <TableCell>
                {hideFilter ? (
                    <Typography
                        component="span"
                        sx={{ mt: 0.5, fontWeight: 500, whiteSpace: 'nowrap' }}
                    >
                        {secondColHeader}
                    </Typography>
                ) : (
                    <DateFilter
                        header={secondColHeader}
                        disabled={
                            !hasStats ||
                            isValidating ||
                            networkFailed ||
                            queryCount === 0
                        }
                        selectableTableStoreName={selectableTableStoreName}
                    />
                )}
            </TableCell>
        </>
    );
};

export default StatsHeader;
