import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { BaseTypographySx } from 'components/tables/cells/logs/shared';
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

    const fetchMoreLogs = useJournalDataLogsStore_fetchMoreLogs();
    const fetchingMore = useJournalDataLogsStore_fetchingMore();

    const runFetch = useRef(true);
    const intersectionRef = useRef<HTMLElement>(null);

    const intersection = useIntersection(intersectionRef, {
        root: null,
        rootMargin: '0px',
        threshold: 1,
    });

    useInterval(
        () => {
            console.log('interval fetching');
            if (!fetchingMore && intersection?.isIntersecting) {
                console.log('   fetching run');
                runFetch.current = false;
                fetchMoreLogs(fetchOption);
            } else {
                runFetch.current = true;
            }
        },
        intersection?.isIntersecting ? 500 : null
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
