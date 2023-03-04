import EntityExistenceGuard from 'app/guards/EntityExistenceGuard';
import AccessGrants from 'components/admin/AccessGrants';
import AdminApi from 'components/admin/Api';
import AdminConnectors from 'components/admin/Connectors';
import AdminCookies from 'components/admin/Cookies';
import StorageMappings from 'components/admin/StorageMappings';
import CaptureCreate from 'components/capture/Create';
import CaptureCreateConfig from 'components/capture/Create/Config';
import CaptureEdit from 'components/capture/Edit';
import MaterializationCreate from 'components/materialization/Create';
import MaterializationCreateConfig from 'components/materialization/Create/Config';
import MaterializationEdit from 'components/materialization/Edit';
import AuthenticatedOnlyContext from 'context/Authenticated';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { OAuthPopup } from 'hooks/forks/react-use-oauth2/components';
import Admin from 'pages/Admin';
import Auth from 'pages/Auth';
import Captures from 'pages/Captures';
import Collections from 'pages/Collections';
import TestJsonForms from 'pages/dev/TestJsonForms';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import Materializations from 'pages/Materializations';
import { Route, Routes } from 'react-router';
import { isProduction } from 'utils/env-utils';
import AppLayout from './Layout';
import { authenticatedRoutes, unauthenticatedRoutes } from './routes';

const Authenticated = () => {
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
                    {/*This is a QUICK fix so when someone comes through register they won't land on a page not found page*/}
                    <Route
                        path={unauthenticatedRoutes.register.path}
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
                                        <CaptureCreateConfig />
                                    </WorkflowContextProvider>
                                </EntityContextProvider>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.create.new.path}
                            element={
                                <EntityContextProvider value="capture">
                                    <WorkflowContextProvider value="capture_create">
                                        <CaptureCreate />
                                    </WorkflowContextProvider>
                                </EntityContextProvider>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.edit.path}
                            element={
                                <EntityContextProvider value="capture">
                                    <WorkflowContextProvider value="capture_edit">
                                        <EntityExistenceGuard>
                                            <CaptureEdit />
                                        </EntityExistenceGuard>
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
                                        <MaterializationCreateConfig />
                                    </WorkflowContextProvider>
                                </EntityContextProvider>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.create.new
                                    .path
                            }
                            element={
                                <EntityContextProvider value="materialization">
                                    <WorkflowContextProvider value="materialization_create">
                                        <MaterializationCreate />
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
                                        <EntityExistenceGuard>
                                            <MaterializationEdit />
                                        </EntityExistenceGuard>
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
                        <Route
                            path={authenticatedRoutes.admin.cookies.path}
                            element={<AdminCookies />}
                        />
                        <Route
                            path={
                                authenticatedRoutes.admin.storageMappings.path
                            }
                            element={<StorageMappings />}
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
