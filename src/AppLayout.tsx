import { Box, Drawer, Toolbar, useTheme } from '@mui/material';
import SidePanelConnectorDocs from 'components/docs';
import { useDocs } from 'context/Docs';
import { NavWidths } from 'context/Theme';
import { useEffect, useState } from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { Outlet } from 'react-router';
import { useLocalStorage } from 'react-use';
import { LocalStorageKeys } from 'utils/localStorage-utils';
import Navigation from './components/navigation/Navigation';

function AppLayout() {
    const theme = useTheme();
    const [navigationConfig, setNavigationConfig] = useLocalStorage(
        LocalStorageKeys.NAVIGATION_SETTINGS,
        { open: true }
    );

    const navigationOpen = navigationConfig?.open ?? true;
    const navigationWidth: NavWidths = navigationConfig?.open
        ? NavWidths.FULL
        : NavWidths.RAIL;

    const toggleNavigationDrawer = () => {
        setNavigationConfig({ open: !navigationOpen });
    };

    // Splitter for the side panel docs
    const [leftPaneFlex, setLeftPaneFlex] = useState<any>(0.0);
    const [rightPaneFlex, setRightPaneFlex] = useState<any>(0.0);
    const { docsURL } = useDocs();
    const showDocs = docsURL !== null;

    // We want to control the flex and not size as it seems to work better
    //  when showing/hiding and also allows a sort of percentage view instead
    //  of hardcoded size values
    useEffect(() => {
        setLeftPaneFlex(showDocs ? 0.7 : 1.0);
        setRightPaneFlex(showDocs ? 0.3 : 0.0);
    }, [showDocs]);

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
                    <ReflexElement
                        className="left-pane"
                        minSize={theme.breakpoints.values.sm / 2}
                        flex={leftPaneFlex}
                    >
                        <Box className="pane-content">
                            <Toolbar />
                            <Outlet />
                        </Box>
                    </ReflexElement>

                    <ReflexSplitter
                        style={{
                            height: 'auto',
                            width: showDocs ? 5 : 0,
                            display: showDocs ? 'flex' : 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />

                    <ReflexElement
                        className="right-pane"
                        minSize={showDocs ? 50 : 0}
                        maxSize={showDocs ? 700 : 0}
                        flex={rightPaneFlex}
                    >
                        <Drawer
                            anchor="right"
                            variant="persistent"
                            className="pane-content"
                            sx={{
                                'display': { xs: 'none', sm: 'block' },
                                'width': '100%',
                                '& .MuiDrawer-paper': {
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    position: 'absolute',
                                },
                            }}
                            open={showDocs}
                        >
                            <SidePanelConnectorDocs />
                        </Drawer>
                    </ReflexElement>
                </ReflexContainer>
            </Box>
        </Box>
    );
}

export default AppLayout;
