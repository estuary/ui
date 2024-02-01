import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { BaseTypographySx } from 'components/tables/cells/logs/shared';
import { tableRowActiveBackground } from 'context/Theme';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import useOnScreen from '@custom-react-hooks/use-on-screen';
import { WaitingForRowProps } from './types';

interface Props extends WaitingForRowProps {
    messageKey: string;
}

function WaitingForRowBase({ messageKey, sizeRef, style }: Props) {
    const theme = useTheme();

    const { ref, isIntersecting } = useOnScreen({ threshold: 1 }, false);

    useEffect(() => {
        console.log(`${messageKey}`, isIntersecting);
    }, [messageKey, isIntersecting]);

    return (
        <TableRow
            component={Box}
            ref={sizeRef}
            style={style}
            sx={{
                bgcolor: tableRowActiveBackground[theme.palette.mode],
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
                        <FormattedMessage id={messageKey} />
                    </Typography>
                </TableCell>
            </Box>
        </TableRow>
    );
}

export default WaitingForRowBase;
