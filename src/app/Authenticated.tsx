import AppLayout from 'AppLayout';
import CaptureCreate from 'components/capture/Create';
import { createEditorStore } from 'components/editor/Store';
import NewMaterialization from 'components/materialization/create';
import { ZustandProvider } from 'hooks/useZustand';
import Admin from 'pages/Admin';
import Captures from 'pages/Captures';
import Collections from 'pages/Collections';
import Connectors from 'pages/Connectors';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import Materializations from 'pages/Materializations';
import Registration from 'pages/Registration';
import { Route, Routes } from 'react-router';

export const routeDetails = {
    admin: {
        title: 'routeTitle.admin',
        path: '/admin',
    },
    connectors: {
        title: 'routeTitle.connectors',
        path: '/connectors',
    },
    captures: {
        title: 'routeTitle.captures',
        path: '/captures',
        create: {
            title: 'routeTitle.captureCreate',
            path: `create`,
            fullPath: '/captures/create',
            params: {
                connectorID: 'connectorID',
            },
        },
    },
    collections: {
        title: 'routeTitle.collections',
        path: '/collections',
    },
    home: {
        title: 'routeTitle.home',
        path: '/',
    },
    materializations: {
        title: 'routeTitle.materializations',
        path: '/materializations',
        create: {
            title: 'routeTitle.materializationCreate',
            path: 'create',
            fullPath: '/materializations/create',
            params: {
                connectorID: 'connectorID',
            },
        },
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
                <Route path={routeDetails.home.path} element={<Home />} />

                <Route
                    path={routeDetails.connectors.path}
                    element={<Connectors />}
                />

                <Route
                    path={routeDetails.collections.path}
                    element={<Collections />}
                />

                <Route path={routeDetails.captures.path}>
                    <Route path="" element={<Captures />} />
                    <Route
                        path={routeDetails.captures.create.path}
                        element={
                            <ZustandProvider
                                createStore={createEditorStore}
                                storeName="draftSpecEditor"
                            >
                                <CaptureCreate />
                            </ZustandProvider>
                        }
                    />
                </Route>

                <Route path={routeDetails.materializations.path}>
                    <Route path="" element={<Materializations />} />
                    <Route
                        path={routeDetails.materializations.create.path}
                        element={
                            <ZustandProvider
                                createStore={createEditorStore}
                                storeName="draftSpecEditor"
                            >
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
