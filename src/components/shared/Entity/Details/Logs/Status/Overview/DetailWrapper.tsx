import { Box, Typography } from '@mui/material';
import { diminishedTextColor } from 'context/Theme';
import { useIntl } from 'react-intl';
import { DetailWrapperProps } from './types';

export default function DetailWrapper({
    children,
    headerMessageId,
    Hydrating,
}: DetailWrapperProps) {
    const intl = useIntl();

    return (
        <Box>
            <Typography
                noWrap
                sx={{
                    color: (theme) => diminishedTextColor[theme.palette.mode],
                    mb: '2px',
                }}
            >
                {intl.formatMessage({ id: headerMessageId })}
            </Typography>

            {Hydrating ?? children}
        </Box>
    );
}
