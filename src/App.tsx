import { Skeleton, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import NewCaptureModal from 'components/endpointCreation/NewCaptureModal';
import Home from 'pages/Home';
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Navigation from './components/navigation/Navigation';
import Topbar from './components/Topbar';
import Error from './pages/Error';

const Admin = React.lazy(() => import('./pages/Admin'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const Collections = React.lazy(() => import('./pages/Collections'));
const Users = React.lazy(() => import('./pages/Users'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Logs = React.lazy(() => import('./pages/Logs'));

export default function App() {
    const railNavWidth = 63;
    const fullNavWidth = 225;

    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

    const [navigationOpen, setNavigationOpen] = React.useState(false);
    const [navWidth, setNavigationWidth] = React.useState(railNavWidth);

    const toggleNavigationDrawer = () => {
        setNavigationWidth(navigationOpen ? railNavWidth : fullNavWidth);
        setNavigationOpen(!navigationOpen);
    };

    let gridSettings = {
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gridTemplateColumns: `${navWidth}px auto`,
        gridTemplateAreas: `"header header"
        "nav main"`,
    };

    return (
        <Box sx={isBelowMd ? null : gridSettings}>
            <Box sx={{ gridArea: 'header' }}>
                <Topbar
                    title="Estuary Global Actions"
                    isNavigationOpen={navigationOpen}
                    onNavigationToggle={toggleNavigationDrawer}
                />
            </Box>
            <Box sx={{ gridArea: 'nav' }}>
                <Navigation
                    open={navigationOpen}
                    onNavigationToggle={toggleNavigationDrawer}
                    width={navWidth}
                />
            </Box>
            <Box
                sx={{
                    overflow: 'auto',
                    gridArea: 'main',
                }}
            >
                <Suspense fallback={<Skeleton animation="wave" />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/app">
                            <Route
                                path="collections"
                                element={<Collections />}
                            />
                            <Route path="captures" element={<Catalog />}>
                                <Route
                                    path="new"
                                    element={<NewCaptureModal />}
                                />
                            </Route>
                            <Route path="derivations" element={<Catalog />} />
                            <Route
                                path="materializations"
                                element={<Catalog />}
                            />
                            <Route path="admin/*" element={<Admin />}>
                                <Route path="logs" element={<Logs />} />
                                <Route path="alerts" element={<Alerts />} />
                                <Route path="users" element={<Users />} />
                            </Route>
                        </Route>
                        <Route path="*" element={<Error />} />
                    </Routes>
                </Suspense>
            </Box>
        </Box>
    );
}
