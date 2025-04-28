import type { StatsHeaderProps } from 'src/components/tables/cells/stats/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useMemo } from 'react';

import { TableCell, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DateFilter from 'src/components/filters/Date';
import useHideStatsColumnsSx from 'src/components/tables/hooks/useHideStatsColumnsSx';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useZustandStore } from 'src/context/Zustand/provider';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

const StatsHeader = ({
    selectableTableStoreName,
    header,
    hideFilter,
    firstHeaderSuffix,
    secondHeaderSuffix,
}: StatsHeaderProps) => {
    const intl = useIntl();
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);

    const hideStatsColumnsSX = useHideStatsColumnsSx();

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
                    id: firstHeaderSuffix ? firstHeaderSuffix : 'data.written',
                },
                {
                    type: intl.formatMessage({
                        id: header ?? 'data.data',
                    }),
                }
            ),
            intl.formatMessage(
                {
                    id: secondHeaderSuffix
                        ? secondHeaderSuffix
                        : firstHeaderSuffix
                          ? firstHeaderSuffix
                          : 'data.read',
                },
                {
                    type: intl.formatMessage({
                        id: header ?? 'data.docs',
                    }),
                }
            ),
        ];
    }, [firstHeaderSuffix, header, intl, secondHeaderSuffix]);

    return (
        <>
            <TableCell sx={hideStatsColumnsSX}>
                <Typography
                    component="span"
                    sx={{ mt: 0.5, fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                    {firstColHeader}
                </Typography>
            </TableCell>
            <TableCell sx={hideStatsColumnsSX}>
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
                            !hasAnyAccess ||
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
