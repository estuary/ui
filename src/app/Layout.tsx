import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Navigation from 'components/navigation/Navigation';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import DocsSidePanel from 'components/sidePanelDocs/SidePanel';
import { NavWidths } from 'context/Theme';
import { useEffect, useState } from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { Outlet } from 'react-router';
import { useLocalStorage } from 'react-use';
import {
    useSidePanelDocsStore_animateOpening,
    useSidePanelDocsStore_setAnimateOpening,
    useSidePanelDocsStore_show,
} from 'stores/SidePanelDocs/hooks';
import { LocalStorageKeys } from 'utils/localStorage-utils';

function AppLayout() {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

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
    const showDocs = useSidePanelDocsStore_show();
    const displaySidePanel = showDocs && !belowMd;

    // We want to control the flex and not size as it seems to work better
    //  when showing/hiding and also allows a sort of percentage view instead
    //  of hardcoded size values
    useEffect(() => {
        setLeftPaneFlex(displaySidePanel ? 0.7 : 1.0);
        setRightPaneFlex(displaySidePanel ? 0.3 : 0.0);
    }, [displaySidePanel]);

    // So the transition does not mess with a user resizing the elements
    //  and during initial load of the app
    const animateOpening = useSidePanelDocsStore_animateOpening();
    const setAnimateOpening = useSidePanelDocsStore_setAnimateOpening();
    const resizeHandlers = {
        start: () => {
            setAnimateOpening(false);
        },
        stop: () => {
            setAnimateOpening(true);
        },
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
                    <ReflexElement
                        className="left-pane"
                        minSize={theme.breakpoints.values.sm / 2}
                        flex={leftPaneFlex}
                        style={{
                            transitionDuration: animateOpening
                                ? `${theme.transitions.duration.shortest}ms`
                                : undefined,
                        }}
                    >
                        <Box className="pane-content">
                            <ErrorBoundryWrapper>
                                <Toolbar />
                                <Outlet />
                            </ErrorBoundryWrapper>
                        </Box>
                    </ReflexElement>

                    <ReflexSplitter
                        onStartResize={resizeHandlers.start}
                        onStopResize={resizeHandlers.stop}
                        style={{
                            height: 'auto',
                            width: displaySidePanel ? 5 : 0,
                            display: displaySidePanel ? 'flex' : 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />

                    <ReflexElement
                        className="right-pane"
                        minSize={displaySidePanel ? 350 : 0}
                        maxSize={displaySidePanel ? 825 : 0}
                        flex={rightPaneFlex}
                        style={{
                            transitionDuration: animateOpening
                                ? `${theme.transitions.duration.shortest}ms`
                                : undefined,
                        }}
                    >
                        <DocsSidePanel show={displaySidePanel} />
                    </ReflexElement>
                </ReflexContainer>
            </Box>
        </Box>
    );
}

export default AppLayout;
