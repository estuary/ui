import {
    Box,
    Drawer,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import SidePanelConnectorDocs from 'components/docs';
import { NavWidths } from 'context/Theme';
import { Cancel } from 'iconoir-react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { Outlet } from 'react-router';
import { useLocalStorage } from 'react-use';
import {
    useSidePanelDocsStore_setShow,
    useSidePanelDocsStore_show,
} from 'stores/SidePanelDocs/hooks';
import { LocalStorageKeys } from 'utils/localStorage-utils';
import Navigation from './components/navigation/Navigation';

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
    const setShowDocs = useSidePanelDocsStore_setShow();

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
    const [resizeTransition, setResizeTransition] = useState(false);
    const resizeHandlers = {
        start: () => {
            setResizeTransition(false);
        },
        stop: () => {
            setResizeTransition(true);
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
                            transitionDuration: resizeTransition
                                ? `${theme.transitions.duration.shortest}ms`
                                : undefined,
                        }}
                    >
                        <Box className="pane-content">
                            <Toolbar />
                            <Outlet />
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
                            transitionDuration: resizeTransition
                                ? `${theme.transitions.duration.shortest}ms`
                                : undefined,
                        }}
                    >
                        <Drawer
                            anchor="right"
                            variant="permanent"
                            className="pane-content"
                            sx={{
                                'width': '100%',
                                '& .MuiDrawer-paper': {
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    position: 'absolute',
                                },
                            }}
                            open={displaySidePanel}
                        >
                            <Toolbar />

                            <Toolbar
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    p: 1,
                                }}
                            >
                                <Typography variant="h5" component="span">
                                    <FormattedMessage id="entityCreate.docs.header" />
                                </Typography>

                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setShowDocs(false);
                                    }}
                                    sx={{ color: theme.palette.text.primary }}
                                >
                                    <Cancel />
                                </IconButton>
                            </Toolbar>
                            <SidePanelConnectorDocs />
                        </Drawer>
                    </ReflexElement>
                </ReflexContainer>
            </Box>
        </Box>
    );
}

export default AppLayout;
