import { Skeleton, styled } from '@mui/material';
import Box from '@mui/material/Box';
import RequireAuth from 'auth/RequireAuth';
import Home from 'pages/Home';
import Login from 'pages/Login';
import LoginHelp from 'pages/LoginHelp';
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Outlet } from 'react-router-dom';
import Topbar from './components/header/Topbar';
import Navigation from './components/navigation/Navigation';
import Error from './pages/Error';

const Admin = React.lazy(() => import('./pages/Admin'));
const Capture = React.lazy(() => import('./pages/Captures'));
const NewCaptureModal = React.lazy(
    () => import('components/capture/creation/index')
);
const Collections = React.lazy(() => import('./pages/Collections'));
const Users = React.lazy(() => import('./pages/Users'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Logs = React.lazy(() => import('./pages/Logs'));

const App: React.FC = () => {
    enum Widths {
        RAIL = 63,

        FULL = 225,
    }

    const [navigationOpen, setNavigationOpen] = React.useState(false);
    const [navWidth, setNavigationWidth] = React.useState<Widths>(Widths.RAIL);

    const toggleNavigationDrawer = () => {
        setNavigationWidth(navigationOpen ? Widths.RAIL : Widths.FULL);
        setNavigationOpen(!navigationOpen);
    };

    const Root = styled(Box)(({ theme }) => ({
        [theme.breakpoints.up('md')]: {
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gridTemplateColumns: `${navWidth}px auto`,
            gridTemplateAreas: `"header header"
            "nav main"`,
        },
    }));

    function Layout() {
        return (
            <Root>
                <Box sx={{ gridArea: 'header' }}>
                    <Topbar
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
                <Box sx={{ overflow: 'auto', gridArea: 'main' }}>
                    <Suspense fallback={<Skeleton animation="wave" />}>
                        <Outlet />
                    </Suspense>
                </Box>
            </Root>
        );
    }

    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            <Routes>
                {
                    // TODO - do we need the default path to use a "redirector"/"landing" page kind of thing?
                }
                <Route path="" element={<Login />} />
                <Route path="login/*">
                    <Route path="" element={<Login />} />
                    <Route path="help" element={<LoginHelp />} />
                </Route>

                <Route
                    element={
                        <RequireAuth>
                            <Layout />
                        </RequireAuth>
                    }
                >
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/app">
                        <Route path="collections" element={<Collections />} />
                        <Route path="captures" element={<Capture />}>
                            <Route path="new" element={<NewCaptureModal />} />
                        </Route>
                        <Route path="derivations" element={<Error />} />
                        <Route path="materializations" element={<Error />} />
                        <Route path="admin/*" element={<Admin />}>
                            <Route path="logs" element={<Logs />} />
                            <Route path="alerts" element={<Alerts />} />
                            <Route path="users" element={<Users />} />
                        </Route>
                    </Route>
                </Route>
                <Route path="*" element={<Error />} />
            </Routes>
        </Suspense>
    );
};

export default App;
