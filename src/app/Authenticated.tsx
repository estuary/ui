import { Collections } from '@mui/icons-material';
import AppLayout from 'AppLayout';
import CaptureCreate from 'components/capture/Create';
import { ZustandProvider } from 'components/editor/Store';
import NewMaterialization from 'components/materialization/create';
import Admin from 'pages/Admin';
import Captures from 'pages/Captures';
import Dashboard from 'pages/Dashboard';
import PageNotFound from 'pages/error/PageNotFound';
import Materializations from 'pages/Materializations';
import Registration from 'pages/Registration';
import { Route, Routes } from 'react-router';

export const routeDetails = {
    admin: {
        title: 'routeTitle.admin',
        path: '/admin',
    },
    capture: {
        root: '/capture',
        create: {
            title: 'routeTitle.captureCreate',
            path: `create`,
            fullPath: '/capture/create',
            params: {
                connectorID: 'connectorID',
            },
        },
        details: {
            title: 'routeTitle.captureEdit',
            path: 'details',
            fullPath: '/capture/details',
            params: {
                pubID: 'pubID',
            },
        },
    },
    captures: {
        title: 'routeTitle.captures',
        path: '/captures',
    },
    collections: {
        title: 'routeTitle.collections',
        path: '/collections',
    },
    dashboard: {
        title: 'routeTitle.dashboard',
        path: '/',
    },
    materialization: {
        root: '/materialization',
        create: {
            title: 'routeTitle.materializationCreate',
            path: 'create',
            fullPath: '/materialization/create',
            params: {
                connectorID: 'connectorID',
            },
        },
    },
    materializations: {
        title: 'routeTitle.materializations',
        path: '/materializations',
    },
    registration: {
        title: 'routeTitle.registration',
        path: '/register',
    },
    pageNotFound: {
        title: 'routeTitle.error.pageNotFound',
        path: '*',
    },
};

const Authenticated = () => {
    return (
        <Routes>
            <Route
                path={routeDetails.registration.path}
                element={<Registration />}
            />
            <Route element={<AppLayout />}>
                <Route
                    path={routeDetails.dashboard.path}
                    element={<Dashboard />}
                />
                <Route
                    path={routeDetails.collections.path}
                    element={<Collections />}
                />

                <Route
                    path={routeDetails.captures.path}
                    element={<Captures />}
                />
                <Route path={routeDetails.capture.root}>
                    <Route
                        path={routeDetails.capture.create.path}
                        element={
                            <ZustandProvider stateKey="draftSpecEditor">
                                <CaptureCreate />
                            </ZustandProvider>
                        }
                    />
                </Route>

                <Route
                    path={routeDetails.materializations.path}
                    element={<Materializations />}
                />
                <Route path={routeDetails.materialization.root}>
                    <Route
                        path={routeDetails.materialization.create.path}
                        element={
                            <ZustandProvider stateKey="draftSpecEditor">
                                <NewMaterialization />
                            </ZustandProvider>
                        }
                    />
                </Route>

                <Route path={routeDetails.admin.path} element={<Admin />} />
                <Route
                    path={routeDetails.pageNotFound.path}
                    element={<PageNotFound />}
                />
            </Route>
        </Routes>
    );
};

export default Authenticated;
