import type { BaseComponentProps } from 'src/types';

import { Box, useTheme } from '@mui/material';

import { codeBackground } from 'src/context/Theme';

function PreformattedBlock({ children }: BaseComponentProps) {
    const theme = useTheme();
    return (
        <Box
            component="pre"
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: codeBackground[theme.palette.mode],
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 12,
            }}
        >
            {children}
        </Box>
    );
}

export default PreformattedBlock;
