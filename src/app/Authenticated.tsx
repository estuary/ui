import AppLayout from 'AppLayout';
import AccessGrants from 'components/admin/AccessGrants';
import AdminApi from 'components/admin/Api';
import AdminConnectors from 'components/admin/Connectors';
import CaptureCreate from 'components/capture/Create';
import CaptureEdit from 'components/capture/Edit';
import MaterializationCreate from 'components/materialization/Create';
import MaterializationEdit from 'components/materialization/Edit';
import AuthenticatedOnlyContext from 'context/Authenticated';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { OAuthPopup } from 'hooks/forks/react-use-oauth2/components';
import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import Admin from 'pages/Admin';
import Auth from 'pages/Auth';
import Captures from 'pages/Captures';
import Collections from 'pages/Collections';
import TestJsonForms from 'pages/dev/TestJsonForms';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import Materializations from 'pages/Materializations';
import { Route, Routes } from 'react-router';
import { EndpointConfigProvider } from 'stores/EndpointConfig';
import { isProduction } from 'utils/env-utils';
import { authenticatedRoutes, unauthenticatedRoutes } from './routes';

const Authenticated = () => {
    // TODO: Determine whether a context provider or a hook should be used to fetch the initial auth gateway URL and token.
    // The context provider results in a duped, gateway auth token API call.
    useGatewayAuthToken();

    console.log('Authenticated');

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
                            <EntityContextProvider value="collection">
                                <Collections />
                            </EntityContextProvider>
                        }
                    />

                    <Route path={authenticatedRoutes.captures.path}>
                        <Route
                            path=""
                            element={
                                <EntityContextProvider value="capture">
                                    <Captures />
                                </EntityContextProvider>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.create.path}
                            element={
                                <EntityContextProvider value="capture">
                                    <WorkflowContextProvider value="capture_create">
                                        <EndpointConfigProvider>
                                            <CaptureCreate />
                                        </EndpointConfigProvider>
                                    </WorkflowContextProvider>
                                </EntityContextProvider>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.edit.path}
                            element={
                                <EntityContextProvider value="capture">
                                    <WorkflowContextProvider value="capture_edit">
                                        <EndpointConfigProvider>
                                            <CaptureEdit />
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
                                <EntityContextProvider value="materialization">
                                    <Materializations />
                                </EntityContextProvider>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.create.path
                            }
                            element={
                                <EntityContextProvider value="materialization">
                                    <WorkflowContextProvider value="materialization_create">
                                        <EndpointConfigProvider>
                                            <MaterializationCreate />
                                        </EndpointConfigProvider>
                                    </WorkflowContextProvider>
                                </EntityContextProvider>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.edit.path
                            }
                            element={
                                <EntityContextProvider value="materialization">
                                    <WorkflowContextProvider value="materialization_edit">
                                        <EndpointConfigProvider>
                                            <MaterializationEdit />
                                        </EndpointConfigProvider>
                                    </WorkflowContextProvider>
                                </EntityContextProvider>
                            }
                        />
                    </Route>

                    <Route path={authenticatedRoutes.admin.path}>
                        <Route path="" element={<Admin />} />
                        <Route
                            path={authenticatedRoutes.admin.accessGrants.path}
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
                                <EntityContextProvider value="capture">
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
};

export default Authenticated;
