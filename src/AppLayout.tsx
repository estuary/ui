import { Box } from '@mui/material';
import { Outlet } from 'react-router';
import { useLocalStorage } from 'react-use';
import { LocalStorageKeys } from 'utils/localStorage-utils';
import Navigation from './components/navigation/Navigation';

export enum Widths {
    MOBILE = 0,
    RAIL = 57,
    FULL = 225,
}

function AppLayout() {
    const [navigationConfig, setNavigationConfig] = useLocalStorage(
        LocalStorageKeys.NAVIGATION_SETTINGS,
        { open: true, width: Widths.FULL }
    );

    const navigationOpen = navigationConfig?.open ?? true;
    const navigationWidth: Widths = navigationConfig?.width ?? Widths.FULL;

    const toggleNavigationDrawer = () => {
        setNavigationConfig({
            open: !navigationOpen,
            width: navigationOpen ? Widths.RAIL : Widths.FULL,
        });
    };

    return (
        <Box>
            <Box>
                <Navigation
                    open={navigationOpen}
                    width={navigationWidth}
                    onNavigationToggle={toggleNavigationDrawer}
                />
            </Box>

            <Box sx={{ ml: `${navigationWidth}px` }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default AppLayout;
