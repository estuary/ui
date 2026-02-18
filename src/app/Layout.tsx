import { useEffect, useState } from 'react';

import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { Outlet } from 'react-router';
import { useLocalStorage } from 'react-use';

import Navigation from 'src/components/navigation/Navigation';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import PageContainer from 'src/components/shared/PageContainer';
import DocsSidePanel from 'src/components/sidePanelDocs/SidePanel';
import { useShowSidePanelDocs } from 'src/context/SidePanelDocs';
import { NavWidths } from 'src/context/Theme';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';
import { hasLength } from 'src/utils/misc-utils';

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

    const [animateOpening, setAnimateOpening, docsURL] = useSidePanelDocsStore(
        useShallow((state) => [state.animateOpening, state.setAnimateOpening, state.url])
    );

    const { showDocs } = useShowSidePanelDocs();

    const displaySidePanel = Boolean(
        showDocs && !belowMd && hasLength(docsURL)
    );

    // We want to control the flex and not size as it seems to work better
    //  when showing/hiding and also allows a sort of percentage view instead
    //  of hardcoded size values
    useEffect(() => {
        setLeftPaneFlex(displaySidePanel ? 0.7 : 1.0);
        setRightPaneFlex(displaySidePanel ? 0.3 : 0.0);
    }, [displaySidePanel]);

    // So the transition does not mess with a user resizing the elements
    //  and during initial load of the app
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
                                <PageContainer>
                                    <Outlet />
                                </PageContainer>
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
