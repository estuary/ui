import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { BaseTypographySx } from 'components/tables/cells/logs/shared';
import { DEFAULT_POLLING } from 'context/SWR';
import {
    tableRowActive_Finished__Background,
    tableRowActive__Background,
} from 'context/Theme';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useIntersection } from 'react-use';
import {
    useJournalDataLogsStore_fetchingMore,
    useJournalDataLogsStore_fetchMoreLogs,
} from 'stores/JournalData/Logs/hooks';
import { FetchMoreLogsOptions, WaitingForRowProps } from '../types';

interface Props extends WaitingForRowProps {
    fetchOption: FetchMoreLogsOptions;
    disabled?: boolean;
}

function WaitingForRowBase({ disabled, fetchOption, sizeRef, style }: Props) {
    const theme = useTheme();

    const runFetch = useRef(true);

    const [intervalLength, setIntervalLength] = useState(500);

    const intersectionRef = useRef<HTMLElement>(null);
    const intersection = useIntersection(intersectionRef, {
        root: null,
        rootMargin: '0px',
        threshold: 0.75,
    });

    const messageKey = `ops.logsTable.waitingForLogs.${fetchOption}`;

    const fetchMoreLogs = useJournalDataLogsStore_fetchMoreLogs();
    const fetchingMore = useJournalDataLogsStore_fetchingMore();

    const fetchMore = useCallback(() => {
        console.log('fetchingMore');
        if (!fetchingMore && intersection?.isIntersecting) {
            runFetch.current = false;

            // When checking for new ones fall back to give some time
            //  for the entity to actually write logs
            if (fetchOption === 'new') {
                setIntervalLength(DEFAULT_POLLING);
            }
            fetchMoreLogs(fetchOption);
        } else {
            runFetch.current = true;
        }
    }, [
        fetchMoreLogs,
        fetchOption,
        fetchingMore,
        intersection?.isIntersecting,
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(debounce(fetchMore, intervalLength), [
        fetchMore,
        intervalLength,
    ]);

    useEffect(() => {
        if (!disabled && intersection?.isIntersecting) {
            debouncedFetch();
        }
    }, [debouncedFetch, disabled, intersection?.isIntersecting]);

    return (
        <TableRow
            component={Box}
            ref={sizeRef}
            style={style}
            sx={{
                bgcolor: disabled
                    ? tableRowActive_Finished__Background[theme.palette.mode]
                    : tableRowActive__Background[theme.palette.mode],
                opacity: disabled || intersection?.isIntersecting ? 1 : 0,
                transition: 'all 50ms ease-in-out',
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
                    <SpinnerIcon stopped={Boolean(disabled)} />
                </TableCell>
                <TableCell sx={{ width: '100%' }} component="div">
                    <Typography sx={BaseTypographySx}>
                        <FormattedMessage
                            id={
                                disabled ? `${messageKey}.complete` : messageKey
                            }
                        />
                    </Typography>
                </TableCell>
            </Box>
        </TableRow>
    );
}

export default WaitingForRowBase;
