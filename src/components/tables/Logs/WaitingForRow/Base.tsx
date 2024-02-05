import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { BaseTypographySx } from 'components/tables/cells/logs/shared';
import { DEFAULT_POLLING } from 'context/SWR';
import { tableRowActiveBackground } from 'context/Theme';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useIntersection, useInterval } from 'react-use';
import {
    useJournalDataLogsStore_fetchingMore,
    useJournalDataLogsStore_fetchMoreLogs,
} from 'stores/JournalData/Logs/hooks';
import { FetchMoreLogsOptions, WaitingForRowProps } from '../types';

interface Props extends WaitingForRowProps {
    fetchOption: FetchMoreLogsOptions;
}

function WaitingForRowBase({ fetchOption, sizeRef, style }: Props) {
    const theme = useTheme();

    const runFetch = useRef(true);
    const intervalLength = useRef(250);

    const intersectionRef = useRef<HTMLElement>(null);
    const intersection = useIntersection(intersectionRef, {
        root: null,
        rootMargin: '0px',
        threshold: 1,
    });

    const fetchMoreLogs = useJournalDataLogsStore_fetchMoreLogs();
    const fetchingMore = useJournalDataLogsStore_fetchingMore();

    useInterval(
        () => {
            if (!fetchingMore && intersection?.isIntersecting) {
                runFetch.current = false;
                intervalLength.current = DEFAULT_POLLING;
                fetchMoreLogs(fetchOption);
            } else {
                runFetch.current = true;
            }
        },
        intersection?.isIntersecting ? intervalLength.current : null
    );

    return (
        <TableRow
            component={Box}
            ref={sizeRef}
            style={style}
            sx={{
                bgcolor: tableRowActiveBackground[theme.palette.mode],
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
                    <SpinnerIcon stopped={false} />
                </TableCell>
                <TableCell sx={{ width: '100%' }} component="div">
                    <Typography sx={BaseTypographySx}>
                        <FormattedMessage
                            id={`ops.logsTable.waitingForLogs.${fetchOption}`}
                        />
                    </Typography>
                </TableCell>
            </Box>
        </TableRow>
    );
}

export default WaitingForRowBase;
