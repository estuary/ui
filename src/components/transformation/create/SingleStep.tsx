import type { BaseComponentProps } from 'types';
import { Box, FormLabel } from '@mui/material';

function SingleStep({ children }: BaseComponentProps) {
    return (
        <Box sx={{ py: 1, px: 1.25 }}>
            <FormLabel required sx={{ fontWeight: 500 }}>
                {children}
            </FormLabel>
        </Box>
    );
}

export default SingleStep;
