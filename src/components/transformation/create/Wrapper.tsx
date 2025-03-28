import { Box } from '@mui/material';

import { intensifiedOutline } from 'src/context/Theme';
import { BaseComponentProps } from 'src/types';

function StepWrapper({ children }: BaseComponentProps) {
    return (
        <Box
            sx={{
                border: (theme) => intensifiedOutline[theme.palette.mode],
                borderRadius: 3,
                flex: 1,
                // Prevents the white background of the header from chopping off
                // the rounded corners of the border
                overflow: 'hidden',
            }}
        >
            {children}
        </Box>
    );
}

export default StepWrapper;
