import { useTheme } from '@mui/material';

import { logoColors } from 'src/context/Theme';

// Data is the dashboard's light blue in dark mode and its primary blue in
// light mode, where the light blue washes out. Task hours are the logo teal.
export function useUsageColors() {
    const theme = useTheme();

    return {
        data:
            theme.palette.mode === 'dark'
                ? theme.palette.secondary.main
                : theme.palette.primary.main,
        hours: logoColors.teal,
    };
}
