import { Box, buttonBaseClasses, listClasses, styled } from '@mui/material';

// Mainly to allow digital clocks to render better when making them a bit
//  wider than how they would naturally render

// If there are ever type issues with the `styled(Box)` look here -> https://mui.com/material-ui/migration/upgrade-to-v6/#breaking-changes-affecting-types
export const CustomLayoutWrapper = styled(Box)({
    minWidth: 250,
    [`& .${listClasses.root}`]: {
        flexGrow: 1,
        [`& .${buttonBaseClasses.root}`]: {
            width: '100%',
        },
    },
});
