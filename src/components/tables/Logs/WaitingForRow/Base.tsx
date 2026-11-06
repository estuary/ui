import type { ReactNode } from 'react';
import type {
    FetchMoreLogsOptions,
    WaitingForRowProps,
} from 'src/components/tables/Logs/types';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';

import { WarningCircle } from 'iconoir-react';
import { debounce } from 'lodash';
import { useIntersection, useUnmount } from 'react-use';

import SpinnerIcon from 'src/components/logs/SpinnerIcon';
import { BaseTypographySx } from 'src/components/tables/cells/logs/shared';
import { VIRTUAL_TABLE_BODY_PADDING } from 'src/components/tables/Logs/shared';
import {
    errorOutlinedButtonBackground,
    tableRowActive__Background,
    tableRowActive_Finished__Background,
} from 'src/context/Theme';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

interface Props extends WaitingForRowProps {
    fetchOption: FetchMoreLogsOptions;
    disabled?: boolean;
    // Replaces the default copy shown while disabled
    disabledContent?: ReactNode;
    interval?: number;
}

const MESSAGES: Record<
    FetchMoreLogsOptions,
    { active: string; complete: string; failed: string }
> = {
    old: {
        active: 'Fetching older logs',
        complete: 'All older logs read',
        failed: 'A network error occurred. Please reload.',
    },
    new: {
        active: 'Waiting for new logs',
        complete: 'Waiting for new logs',
        failed: 'A network error occurred. Please reload.',
    },
};

function WaitingForRowBase({
    disabled,
    disabledContent,
    interval = 500,
    fetchOption,
    sizeRef,
    style,
}: Props) {
    const theme = useTheme();

    const [allowFetch, setAllowFetch] = useState(false);
    // Bumped when the store declines a fetch. Nothing else this row watches changes
    //  in that case, so without it the row would sit on its spinner forever.
    const [declinedFetches, setDeclinedFetches] = useState(0);

    const intersectionRef = useRef<HTMLElement>(null);
    const intersection = useIntersection(intersectionRef, {
        root: null,
        rootMargin: `${VIRTUAL_TABLE_BODY_PADDING}px`,
        threshold: 0.7,
    });

    const messages = MESSAGES[fetchOption];

    const lastFetchFailed = useJournalDataLogsStore(
        (state) => state.lastFetchFailed
    );
    const fetchMoreLogs = useJournalDataLogsStore(
        (state) => state.fetchMoreLogs
    );
    const fetchingMore = useJournalDataLogsStore((state) => state.fetchingMore);

    // Kinda hacky - but checking this flag here keeps the effect trigger
    //  as it is flipped back and forth
    const fetchMore = useCallback(() => {
        setAllowFetch(false);
        if (!fetchMoreLogs(fetchOption)) {
            setDeclinedFetches((count) => count + 1);
        }
    }, [fetchMoreLogs, fetchOption]);

    // Cannot figure out the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(debounce(fetchMore, interval), [
        fetchMore,
    ]);
    useUnmount(() => {
        debouncedFetch.cancel();
    });

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
        declinedFetches,
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
                    {!lastFetchFailed && disabled && disabledContent ? (
                        disabledContent
                    ) : (
                        <Typography sx={BaseTypographySx}>
                            {lastFetchFailed
                                ? messages.failed
                                : disabled
                                  ? messages.complete
                                  : messages.active}
                        </Typography>
                    )}
                </TableCell>
            </Box>
        </TableRow>
    );
}

export default WaitingForRowBase;
