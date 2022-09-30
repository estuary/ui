import NoGrantsFound from 'app/NoGrantsFound';
import { unauthenticatedRoutes } from 'app/Unauthenticated';
import AppLayout from 'AppLayout';
import AccessGrants from 'components/admin/AccessGrants';
import AdminApi from 'components/admin/Api';
import AdminConnectors from 'components/admin/Connectors';
import CaptureCreate from 'components/capture/Create';
import CaptureEdit from 'components/capture/Edit';
import FullPageSpinner from 'components/fullPage/Spinner';
import MaterializationCreate from 'components/materialization/Create';
import MaterializationEdit from 'components/materialization/Edit';
import AuthenticatedOnlyContext from 'context/Authenticated';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { OAuthPopup } from 'hooks/forks/react-use-oauth2/components';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import Admin from 'pages/Admin';
import Auth from 'pages/Auth';
import Captures from 'pages/Captures';
import Collections from 'pages/Collections';
import TestJsonForms from 'pages/dev/TestJsonForms';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import Materializations from 'pages/Materializations';
import Registration from 'pages/Registration';
import { Route, Routes } from 'react-router';
import { EndpointConfigProvider } from 'stores/EndpointConfig';
import { ResourceConfigProvider } from 'stores/ResourceConfig';
import { ENTITY } from 'types';
import { isProduction } from 'utils/env-utils';

export const authenticatedRoutes = {
    oauth: {
        path: '/oauth',
    },
    admin: {
        title: 'routeTitle.admin',
        path: '/admin',
        accessGrants: {
            title: 'routeTitle.admin.accessGrants',
            path: 'accessGrants',
            fullPath: '/admin/accessGrants',
        },
        api: {
            title: 'routeTitle.admin.api',
            path: 'api',
            fullPath: '/admin/api',
        },
        connectors: {
            title: 'routeTitle.admin.connectors',
            path: 'connectors',
            fullPath: '/admin/connectors',
        },
    },
    captures: {
        title: 'routeTitle.captures',
        path: '/captures',
        create: {
            title: 'routeTitle.captureCreate',
            path: `create`,
            fullPath: '/captures/create',
        },
        edit: {
            title: 'routeTitle.captureEdit',
            path: `edit`,
            fullPath: '/captures/edit',
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
        },
        edit: {
            title: 'routeTitle.materializationEdit',
            path: 'edit',
            fullPath: '/materializations/edit',
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
                    <Route
                        path={authenticatedRoutes.oauth.path}
                        element={<OAuthPopup />}
                    />
                    <Route element={<AppLayout />}>
                        <Route
                            path={authenticatedRoutes.home.path}
                            element={<Home />}
                        />

                        <Route
                            path={authenticatedRoutes.collections.path}
                            element={
                                <EntityContextProvider
                                    value={ENTITY.COLLECTION}
                                >
                                    <Collections />
                                </EntityContextProvider>
                            }
                        />

                        <Route path={authenticatedRoutes.captures.path}>
                            <Route
                                path=""
                                element={
                                    <EntityContextProvider
                                        value={ENTITY.CAPTURE}
                                    >
                                        <Captures />
                                    </EntityContextProvider>
                                }
                            />

                            <Route
                                path={authenticatedRoutes.captures.create.path}
                                element={
                                    <EntityContextProvider
                                        value={ENTITY.CAPTURE}
                                    >
                                        <WorkflowContextProvider value="capture_create">
                                            <EndpointConfigProvider>
                                                <ResourceConfigProvider>
                                                    <CaptureCreate />
                                                </ResourceConfigProvider>
                                            </EndpointConfigProvider>
                                        </WorkflowContextProvider>
                                    </EntityContextProvider>
                                }
                            />

                            <Route
                                path={authenticatedRoutes.captures.edit.path}
                                element={
                                    <EntityContextProvider
                                        value={ENTITY.CAPTURE}
                                    >
                                        <WorkflowContextProvider value="capture_edit">
                                            <EndpointConfigProvider>
                                                <ResourceConfigProvider>
                                                    <CaptureEdit />
                                                </ResourceConfigProvider>
                                            </EndpointConfigProvider>
                                        </WorkflowContextProvider>
                                    </EntityContextProvider>
                                }
                            />
                        </Route>

                        <Route path={authenticatedRoutes.materializations.path}>
                            <Route
                                path=""
                                element={
                                    <EntityContextProvider
                                        value={ENTITY.MATERIALIZATION}
                                    >
                                        <Materializations />
                                    </EntityContextProvider>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.materializations.create
                                        .path
                                }
                                element={
                                    <EntityContextProvider
                                        value={ENTITY.MATERIALIZATION}
                                    >
                                        <WorkflowContextProvider value="materialization_create">
                                            <EndpointConfigProvider>
                                                <ResourceConfigProvider>
                                                    <MaterializationCreate />
                                                </ResourceConfigProvider>
                                            </EndpointConfigProvider>
                                        </WorkflowContextProvider>
                                    </EntityContextProvider>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.materializations.edit
                                        .path
                                }
                                element={
                                    <EntityContextProvider
                                        value={ENTITY.MATERIALIZATION}
                                    >
                                        <WorkflowContextProvider value="materialization_edit">
                                            <EndpointConfigProvider>
                                                <ResourceConfigProvider>
                                                    <MaterializationEdit />
                                                </ResourceConfigProvider>
                                            </EndpointConfigProvider>
                                        </WorkflowContextProvider>
                                    </EntityContextProvider>
                                }
                            />
                        </Route>

                        <Route path={authenticatedRoutes.admin.path}>
                            <Route path="" element={<Admin />} />
                            <Route
                                path={
                                    authenticatedRoutes.admin.accessGrants.path
                                }
                                element={<AccessGrants />}
                            />
                            <Route
                                path={authenticatedRoutes.admin.api.path}
                                element={<AdminApi />}
                            />
                            <Route
                                path={authenticatedRoutes.admin.connectors.path}
                                element={<AdminConnectors />}
                            />
                        </Route>

                        {!isProduction ? (
                            <Route
                                path="test/jsonforms"
                                element={
                                    <EntityContextProvider
                                        value={ENTITY.CAPTURE}
                                    >
                                        <TestJsonForms />
                                    </EntityContextProvider>
                                }
                            />
                        ) : null}

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
