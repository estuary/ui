import AppLayout from 'AppLayout';
import CaptureCreate from 'components/capture/Create';
import { createEditorStore, DraftSpecEditorKey } from 'components/editor/Store';
import NewMaterialization from 'components/materialization/create';
import PreFetchDataContextProvider from 'context/PreFetchData';
import { RouteStoreProvider } from 'hooks/useRouteStore';
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
import { Stores } from 'stores/Repo';

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
        store: {
            key: Stores.CAPTURE_SHARD_DETAIL,
        },
        create: {
            title: 'routeTitle.captureCreate',
            path: `create`,
            fullPath: '/captures/create',
            store: {
                key: Stores.CAPTURE_CREATE,
            },
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
        store: {
            key: Stores.MATERIALIZATION_SHARD_DETAIL,
        },
        create: {
            title: 'routeTitle.materializationCreate',
            path: 'create',
            fullPath: '/materializations/create',
            store: {
                key: Stores.MATERIALIZATION_CREATE,
            },
            params: {
                connectorID: 'connectorID',
                specID: 'specID', // Can consume a live spec ID OR the last published ID
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
        <PreFetchDataContextProvider>
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
                        <Route
                            path=""
                            element={
                                <RouteStoreProvider
                                    routeStoreKey={
                                        routeDetails.captures.store.key
                                    }
                                >
                                    <Captures />
                                </RouteStoreProvider>
                            }
                        />
                        <Route
                            path={routeDetails.captures.create.path}
                            element={
                                <RouteStoreProvider
                                    routeStoreKey={
                                        routeDetails.captures.create.store.key
                                    }
                                >
                                    <ZustandProvider
                                        createStore={createEditorStore}
                                        storeName={`${DraftSpecEditorKey}-Captures`}
                                    >
                                        <CaptureCreate />
                                    </ZustandProvider>
                                </RouteStoreProvider>
                            }
                        />
                    </Route>

                    <Route path={routeDetails.materializations.path}>
                        <Route
                            path=""
                            element={
                                <RouteStoreProvider
                                    routeStoreKey={
                                        routeDetails.materializations.store.key
                                    }
                                >
                                    <Materializations />
                                </RouteStoreProvider>
                            }
                        />
                        <Route
                            path={routeDetails.materializations.create.path}
                            element={
                                <RouteStoreProvider
                                    routeStoreKey={
                                        routeDetails.materializations.create
                                            .store.key
                                    }
                                >
                                    <ZustandProvider
                                        createStore={createEditorStore}
                                        storeName={`${DraftSpecEditorKey}-Materializations`}
                                    >
                                        <NewMaterialization />
                                    </ZustandProvider>
                                </RouteStoreProvider>
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
        </PreFetchDataContextProvider>
    );
};

export default Authenticated;
