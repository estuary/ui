import NoGrantsFound from 'app/NoGrantsFound';
import { unauthenticatedRoutes } from 'app/Unauthenticated';
import AppLayout from 'AppLayout';
import CaptureCreate from 'components/capture/Create';
import FullPageSpinner from 'components/fullPage/Spinner';
import MaterializationCreate from 'components/materialization/Create';
import AuthenticatedOnlyContext from 'context/Authenticated';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import { RouteStoreProvider } from 'hooks/useRouteStore';
import Admin from 'pages/Admin';
import Auth from 'pages/Auth';
import Captures from 'pages/Captures';
import Collections from 'pages/Collections';
import Connectors from 'pages/Connectors';
import TestJsonForms from 'pages/dev/TestJsonForms';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import Materializations from 'pages/Materializations';
import Registration from 'pages/Registration';
import { Route, Routes } from 'react-router';
import { Stores } from 'stores/Repo';
import { isProduction } from 'utils/env-utils';

export const authenticatedRoutes = {
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
                specID: 'specID', // live spec ID
                lastPubId: 'lastPubID', // last published ID
            },
        },
    },
    user: {
        title: 'routeTitle.user',
        path: '/user',
        registration: {
            title: 'routeTitle.registration',
            path: 'register',
            fullPath: '/user/register',
        },
    },
    pageNotFound: {
        title: 'routeTitle.error.pageNotFound',
        path: '*',
    },
};

const Authenticated = () => {
    // TODO: Determine whether a context provider or a hook should be used to fetch the initial auth gateway URL and token.
    // The context provider results in a duped, gateway auth token API call.
    useGatewayAuthToken();

    const { combinedGrants, isValidating } = useCombinedGrantsExt({
        singleCall: true,
    });

    if (isValidating) {
        return <FullPageSpinner />;
    } else if (combinedGrants.length === 0) {
        return (
            <Routes>
                <Route
                    path={unauthenticatedRoutes.auth.path}
                    element={<Auth />}
                />
                <Route path={authenticatedRoutes.user.path}>
                    <Route
                        path={authenticatedRoutes.user.registration.path}
                        element={<Registration />}
                    />
                </Route>
                <Route path="*" element={<NoGrantsFound />} />
            </Routes>
        );
    } else {
        return (
            <AuthenticatedOnlyContext>
                <Routes>
                    {/* TODO (routes) Need to make sure the auth path is handle in any routes. This should be worked into
                            the move of making routes in JSON objects
                    */}
                    <Route
                        path={unauthenticatedRoutes.auth.path}
                        element={<Auth />}
                    />
                    <Route element={<AppLayout />}>
                        <Route
                            path={authenticatedRoutes.home.path}
                            element={<Home />}
                        />

                        <Route
                            path={authenticatedRoutes.connectors.path}
                            element={<Connectors />}
                        />

                        <Route
                            path={authenticatedRoutes.collections.path}
                            element={<Collections />}
                        />

                        <Route path={authenticatedRoutes.captures.path}>
                            <Route
                                path=""
                                element={
                                    <RouteStoreProvider
                                        routeStoreKey={
                                            authenticatedRoutes.captures.store
                                                .key
                                        }
                                    >
                                        <Captures />
                                    </RouteStoreProvider>
                                }
                            />
                            <Route
                                path={authenticatedRoutes.captures.create.path}
                                element={
                                    <RouteStoreProvider
                                        routeStoreKey={
                                            authenticatedRoutes.captures.create
                                                .store.key
                                        }
                                    >
                                        <CaptureCreate />
                                    </RouteStoreProvider>
                                }
                            />
                        </Route>

                        <Route path={authenticatedRoutes.materializations.path}>
                            <Route
                                path=""
                                element={
                                    <RouteStoreProvider
                                        routeStoreKey={
                                            authenticatedRoutes.materializations
                                                .store.key
                                        }
                                    >
                                        <Materializations />
                                    </RouteStoreProvider>
                                }
                            />
                            <Route
                                path={
                                    authenticatedRoutes.materializations.create
                                        .path
                                }
                                element={
                                    <RouteStoreProvider
                                        routeStoreKey={
                                            authenticatedRoutes.materializations
                                                .create.store.key
                                        }
                                    >
                                        <MaterializationCreate />
                                    </RouteStoreProvider>
                                }
                            />
                        </Route>

                        <Route
                            path={authenticatedRoutes.admin.path}
                            element={<Admin />}
                        />
                        {!isProduction && (
                            <Route
                                path="test/jsonforms"
                                element={<TestJsonForms />}
                            />
                        )}
                        <Route
                            path={authenticatedRoutes.pageNotFound.path}
                            element={<PageNotFound />}
                        />
                    </Route>
                </Routes>
            </AuthenticatedOnlyContext>
        );
    }
};

export default Authenticated;
