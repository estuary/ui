import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import NewCaptureModal from 'components/endpointCreation/NewCaptureModal';
import Home from 'pages/Home';
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Navigation from './components/navigation/Navigation';
import Topbar from './components/Topbar';

const Admin = React.lazy(() => import('./pages/Admin'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const Collections = React.lazy(() => import('./pages/Collections'));
const Users = React.lazy(() => import('./pages/Users'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Logs = React.lazy(() => import('./pages/Logs'));

export default function App() {
    const railNavWidth = 65;
    const fullNavWidth = 225;

    const [navigationOpen, setNavigationOpen] = React.useState(false);
    const [navWidth, setNavigationWidth] = React.useState(railNavWidth);

    const toggleNavigationDrawer = () => {
        setNavigationWidth(navigationOpen ? railNavWidth : fullNavWidth);
        setNavigationOpen(!navigationOpen);
    };

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                gridTemplateColumns: `${navWidth}px auto`,
                gridTemplateAreas: `"header header"
        "nav main"`,
            }}
        >
            /
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
                                    path="new/:sourceType"
                                    element={<NewCaptureModal />}
                                />
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
                    </Routes>
                </Suspense>
            </Box>
        </Box>
    );
}
