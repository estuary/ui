import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { BaseTypographySx } from 'components/tables/cells/logs/shared';
import { tableRowActiveBackground } from 'context/Theme';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import useOnScreen from '@custom-react-hooks/use-on-screen';
import { useDebounce } from 'react-use';
import { FetchMoreLogsOptions, WaitingForRowProps } from '../types';

interface Props extends WaitingForRowProps {
    fetchOption: FetchMoreLogsOptions;
}

function WaitingForRowBase({
    fetchMoreLogs,
    fetchOption,
    sizeRef,
    style,
}: Props) {
    const theme = useTheme();

    const runFetch = useRef(true);
    const { ref, isIntersecting } = useOnScreen({ threshold: 1 }, false);

    useDebounce(
        () => {
            console.log('isIntersecting', isIntersecting);
            if (isIntersecting) {
                runFetch.current = false;
                fetchMoreLogs(fetchOption);
            } else {
                runFetch.current = true;
            }
        },
        25,
        [isIntersecting]
    );

    return (
        <TableRow
            component={Box}
            ref={sizeRef}
            style={style}
            sx={{
                bgcolor: tableRowActiveBackground[theme.palette.mode],
                opacity: isIntersecting ? 1 : 0,
                transition: 'all 100ms ease-in-out',
            }}
        >
            <Box ref={ref}>
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
