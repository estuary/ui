import type { DetailWrapperProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';

import { Box, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { diminishedTextColor } from 'src/context/Theme';

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
