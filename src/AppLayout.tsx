import { Box } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router';
import Navigation from './components/navigation/Navigation';

export enum Widths {
    MOBILE = 0,
    RAIL = 57,
    FULL = 225,
}

function AppLayout() {
    const [navigationOpen, setNavigationOpen] = useState(true);
    const [navWidth, setNavigationWidth] = useState<Widths>(Widths.FULL);

    const toggleNavigationDrawer = () => {
        setNavigationWidth(navigationOpen ? Widths.RAIL : Widths.FULL);

        setNavigationOpen(!navigationOpen);
    };

    return (
        <Box>
            <Box>
                <Navigation
                    open={navigationOpen}
                    onNavigationToggle={toggleNavigationDrawer}
                    width={navWidth}
                />
            </Box>

            <Box sx={{ ml: `${navWidth}px` }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default AppLayout;
