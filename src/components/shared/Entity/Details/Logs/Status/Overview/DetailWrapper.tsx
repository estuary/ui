import type { DetailWrapperProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';

import { Box, Typography } from '@mui/material';

export function DetailWrapper({
    children,
    header,
    Hydrating,
}: DetailWrapperProps) {
    return (
        <Box>
            <Typography
                noWrap
                sx={{
                    color: 'text.diminished',
                    mb: '2px',
                }}
            >
                {header}
            </Typography>

            {Hydrating ?? children}
        </Box>
    );
}
