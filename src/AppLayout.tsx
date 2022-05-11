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
    const [navigationOpen, setNavigationOpen] = useState(false);
    const [navWidth, setNavigationWidth] = useState<Widths>(Widths.RAIL);

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

            <Box>
                <Outlet />
            </Box>
        </Box>
    );
}

export default AppLayout;
