import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router';
import Navigation from './components/navigation/Navigation';

export enum Widths {
    MOBILE = 0,
    RAIL = 57,
    FULL = 225,
}

function AppLayout() {
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

    const [navigationOpen, setNavigationOpen] = useState(false);
    const [navWidth, setNavigationWidth] = useState<Widths>(Widths.RAIL);

    const toggleNavigationDrawer = () => {
        if (!isBelowMd) {
            setNavigationWidth(navigationOpen ? Widths.RAIL : Widths.FULL);
        }

        setNavigationOpen(!navigationOpen);
    };

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateAreas: `"nav main"`,
                gridTemplateColumns: `${
                    isBelowMd ? Widths.MOBILE : navWidth
                }px auto`,
                gridTemplateRows: 'auto 1fr',
            }}
        >
            <Box sx={{ gridArea: 'nav' }}>
                <Navigation
                    open={navigationOpen}
                    onNavigationToggle={toggleNavigationDrawer}
                    width={isBelowMd ? Widths.FULL : navWidth}
                />
            </Box>

            <Box sx={{ gridArea: 'main' }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default AppLayout;
