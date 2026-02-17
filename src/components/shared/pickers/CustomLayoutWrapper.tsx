import { Box, styled } from '@mui/material';

// Mainly to allow digital clocks to render better when making them a bit
//  wider than how they would naturally render
export const CustomLayoutWrapper = styled(Box)({
    minWidth: 250,
    [`& .MuiList-root`]: {
        flexGrow: 1,
        [`& .MuiButtonBase-root`]: {
            width: '100%',
        },
    },
});
