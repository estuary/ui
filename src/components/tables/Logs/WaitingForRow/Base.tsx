import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { BaseTypographySx } from 'components/tables/cells/logs/shared';
import {
    errorOutlinedButtonBackground,
    tableRowActive_Finished__Background,
    tableRowActive__Background,
} from 'context/Theme';
import { WarningCircle } from 'iconoir-react';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useIntersection } from 'react-use';
import {
    useJournalDataLogsStore_fetchingMore,
    useJournalDataLogsStore_fetchMoreLogs,
    useJournalDataLogsStore_lastFetchFailed,
} from 'stores/JournalData/Logs/hooks';
import { VIRTUAL_TABLE_BODY_PADDING } from '../shared';
import { FetchMoreLogsOptions, WaitingForRowProps } from '../types';

interface Props extends WaitingForRowProps {
    fetchOption: FetchMoreLogsOptions;
    disabled?: boolean;
    interval?: number;
}

function WaitingForRowBase({
    disabled,
    interval = 500,
    fetchOption,
    sizeRef,
    style,
}: Props) {
    const theme = useTheme();

    const [allowFetch, setAllowFetch] = useState(false);

    const intersectionRef = useRef<HTMLElement>(null);
    const intersection = useIntersection(intersectionRef, {
        root: null,
        rootMargin: `${VIRTUAL_TABLE_BODY_PADDING}px`,
        threshold: 0.7,
    });

    const messageKey = `ops.logsTable.waitingForLogs.${fetchOption}`;

    const lastFetchFailed = useJournalDataLogsStore_lastFetchFailed();
    const fetchMoreLogs = useJournalDataLogsStore_fetchMoreLogs();

    // Kinda hacky - but checking this flag here keeps the effect trigger
    //  as it is flipped back and forth
    const fetchingMore = useJournalDataLogsStore_fetchingMore();

    const fetchMore = useCallback(() => {
        setAllowFetch(false);
        fetchMoreLogs(fetchOption);
    }, [fetchMoreLogs, fetchOption]);

    // Cannot figure out the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(debounce(fetchMore, interval), [
        fetchMore,
    ]);

    // If at anytime the row is not visible cancel any ongoing loading
    useEffect(() => {
        if (!intersection?.isIntersecting) {
            debouncedFetch.cancel();
        }
    }, [debouncedFetch, intersection?.isIntersecting]);

    // Keeping all this logic in a stand alone effect/state because we might
    //  need to expand this beyond just checking some simple booleans
    useEffect(() => {
        setAllowFetch(
            Boolean(
                !fetchingMore &&
                    !lastFetchFailed &&
                    !disabled &&
                    intersection?.isIntersecting
            )
        );
    }, [
        debouncedFetch,
        disabled,
        fetchingMore,
        intersection?.isIntersecting,
        lastFetchFailed,
    ]);

    useEffect(() => {
        if (allowFetch) {
            debouncedFetch();
        }
    }, [allowFetch, debouncedFetch]);

    return (
        <TableRow
            component={Box}
            ref={sizeRef}
            style={style}
            sx={{
                bgcolor: lastFetchFailed
                    ? errorOutlinedButtonBackground[theme.palette.mode]
                    : disabled
                    ? tableRowActive_Finished__Background[theme.palette.mode]
                    : tableRowActive__Background[theme.palette.mode],
                opacity:
                    lastFetchFailed || disabled || intersection?.isIntersecting
                        ? 1
                        : 0,
                transition: 'all 100ms ease-in-out',
            }}
        >
            <Box ref={intersectionRef}>
                <TableCell component="div" />
                <TableCell
                    sx={{
                        pl: 2.5,
                    }}
                    component="div"
                >
                    {lastFetchFailed ? (
                        <Typography sx={{ ...BaseTypographySx, fontSize: 0 }}>
                            <WarningCircle
                                fontSize={12}
                                style={{ color: theme.palette.error.main }}
                            />
                        </Typography>
                    ) : (
                        <SpinnerIcon stopped={Boolean(disabled)} />
                    )}
                </TableCell>
                <TableCell sx={{ width: '100%' }} component="div">
                    <Typography sx={BaseTypographySx}>
                        <FormattedMessage
                            id={
                                lastFetchFailed
                                    ? `${messageKey}.failed`
                                    : disabled
                                    ? `${messageKey}.complete`
                                    : messageKey
                            }
                        />
                    </Typography>
                </TableCell>
            </Box>
        </TableRow>
    );
}

export default WaitingForRowBase;
