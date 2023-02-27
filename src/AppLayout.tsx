import { Box, Toolbar } from '@mui/material';
import SidePanelConnectorDocs from 'components/docs';
import { NavWidths } from 'context/Theme';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { Outlet } from 'react-router';
import { useLocalStorage } from 'react-use';
import { LocalStorageKeys } from 'utils/localStorage-utils';
import Navigation from './components/navigation/Navigation';

function AppLayout() {
    const [navigationConfig, setNavigationConfig] = useLocalStorage(
        LocalStorageKeys.NAVIGATION_SETTINGS,
        { open: true }
    );

    // const theme = useTheme();
    const navigationOpen = navigationConfig?.open ?? true;
    const navigationWidth: NavWidths = navigationConfig?.open
        ? NavWidths.FULL
        : NavWidths.RAIL;

    const toggleNavigationDrawer = () => {
        setNavigationConfig({ open: !navigationOpen });
    };

    return (
        <Box sx={{ height: '100vh' }}>
            <Box>
                <Navigation
                    open={navigationOpen}
                    width={navigationWidth}
                    onNavigationToggle={toggleNavigationDrawer}
                />
            </Box>

            <Box
                sx={{
                    ml: `${navigationWidth}px`,
                    height: '100%',
                }}
            >
                <ReflexContainer orientation="vertical">
                    <ReflexElement className="left-pane" minSize={250}>
                        <div className="pane-content">
                            <Toolbar />
                            <Outlet />
                        </div>
                    </ReflexElement>

                    <ReflexSplitter
                        style={{
                            height: 'auto',
                            width: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />

                    <ReflexElement
                        className="right-pane"
                        size={25}
                        minSize={25}
                        maxSize={700}
                    >
                        <div
                            className="pane-content"
                            style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <SidePanelConnectorDocs />
                        </div>
                    </ReflexElement>
                </ReflexContainer>
            </Box>
        </Box>
    );
}

export default AppLayout;
