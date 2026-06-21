import { useEffect, useState } from 'react';

import { Box, useMediaQuery, useTheme } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { Outlet } from 'react-router';
import { useLocalStorage } from 'react-use';

import { Toast } from 'src/components/AgentSkills/Toast';
import CopilotAssistant from 'src/components/copilot/Assistant';
import Navigation from 'src/components/navigation/Navigation';
import Topbar from 'src/components/navigation/TopBar';
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
        useShallow((state) => [
            state.animateOpening,
            state.setAnimateOpening,
            state.url,
        ])
    );

    const { showDocs } = useShowSidePanelDocs();

    const displaySidePanel = Boolean(
        showDocs && !belowMd && hasLength(docsURL)
    );

    useEffect(() => {
        setLeftPaneFlex(displaySidePanel ? 0.7 : 1.0);
        setRightPaneFlex(displaySidePanel ? 0.3 : 0.0);
    }, [displaySidePanel]);

    const resizeHandlers = {
        start: () => {
            setAnimateOpening(false);
        },
        stop: () => {
            setAnimateOpening(true);
        },
    };

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: `${navigationWidth}px 1fr`,
                gridTemplateRows: 'auto 1fr',
                height: '100vh',
                transition: (t) =>
                    `grid-template-columns ${t.transitions.duration.shortest}ms`,
            }}
        >
            <Box sx={{ gridColumn: '1 / -1' }}>
                <Topbar navigationOpen={navigationOpen} />
            </Box>

            <Navigation
                open={navigationOpen}
                width={navigationWidth}
                onNavigationToggle={toggleNavigationDrawer}
            />

            <Toast docsPanelOpen={displaySidePanel} />

            <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
                <ReflexContainer orientation="vertical">
                    <ReflexElement
                        className="left-pane"
                        minSize={theme.breakpoints.values.sm / 2}
                        flex={leftPaneFlex}
                        style={{
                            overflow: 'hidden',
                            transitionDuration: animateOpening
                                ? `${theme.transitions.duration.shortest}ms`
                                : undefined,
                        }}
                    >
                        <Box className="pane-content" sx={{ height: '100%' }}>
                            <ErrorBoundryWrapper>
                                <PageContainer navigationOpen={navigationOpen}>
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

            <CopilotAssistant />
        </Box>
    );
}

export default AppLayout;
