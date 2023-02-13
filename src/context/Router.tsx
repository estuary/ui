import EntityExistenceGuard from 'app/guards/EntityExistenceGuard';
import { authenticatedRoutes, unauthenticatedRoutes } from 'app/routes';
import AppLayout from 'AppLayout';
import AccessGrants from 'components/admin/AccessGrants';
import AdminApi from 'components/admin/Api';
import AdminConnectors from 'components/admin/Connectors';
import AdminCookies from 'components/admin/Cookies';
import StorageMappings from 'components/admin/StorageMappings';
import CaptureCreate from 'components/capture/Create';
import CaptureDetails from 'components/capture/Details';
import CaptureEdit from 'components/capture/Edit';
import CollectionDetails from 'components/collection/Details';
import MaterializationCreate from 'components/materialization/Create';
import MaterializationDetails from 'components/materialization/Details';
import MaterializationEdit from 'components/materialization/Edit';
import { DetailsPageContextProvider } from 'components/shared/Entity/Details/context';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { OAuthPopup } from 'hooks/forks/react-use-oauth2/components';
import useBrowserTitle from 'hooks/useBrowserTitle';
import Admin from 'pages/Admin';
import Auth from 'pages/Auth';
import Captures from 'pages/Captures';
import Collections from 'pages/Collections';
import TestJsonForms from 'pages/dev/TestJsonForms';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import Login from 'pages/Login';
import Materializations from 'pages/Materializations';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom';
import { EndpointConfigProvider } from 'stores/EndpointConfig';
import { isProduction } from 'utils/env-utils';
import { RequireAuth } from './Authenticated';

const ApplicationRouter = () => {
    useBrowserTitle('browserTitle.loginLoading');

    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route>
                <Route
                    path=""
                    element={
                        <RequireAuth firstLoad>
                            <Login />
                        </RequireAuth>
                    }
                />

                <Route
                    path={unauthenticatedRoutes.auth.path}
                    element={<Auth />}
                />
                <Route
                    path={unauthenticatedRoutes.magicLink.path}
                    element={<Auth />}
                />
                <Route
                    path={unauthenticatedRoutes.register.path}
                    element={<Login showRegistration />}
                />

                <Route
                    path="app"
                    element={
                        <AuthenticatedOnlyContext>
                            <AppLayout />
                        </AuthenticatedOnlyContext>
                    }
                >
                    <Route
                        path={authenticatedRoutes.oauth.path}
                        element={<OAuthPopup />}
                    />
                    <Route>
                        <Route
                            path={authenticatedRoutes.home.path}
                            element={<Home />}
                        />

                        <Route
                            path={authenticatedRoutes.home.path}
                            element={<Home />}
                        />

                        <Route path={authenticatedRoutes.collections.path}>
                            <Route
                                path=""
                                element={
                                    <EntityContextProvider value="collection">
                                        <Collections />
                                    </EntityContextProvider>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.collections.details.path
                                }
                            >
                                <Route
                                    path={
                                        authenticatedRoutes.collections.details
                                            .overview.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="overview">
                                            <CollectionDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />

                                <Route
                                    path={
                                        authenticatedRoutes.collections.details
                                            .spec.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="spec">
                                            <CollectionDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />

                                <Route
                                    path={
                                        authenticatedRoutes.collections.details
                                            .history.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="history">
                                            <CollectionDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />
                            </Route>
                        </Route>

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
                                                <EntityExistenceGuard>
                                                    <CaptureEdit />
                                                </EntityExistenceGuard>
                                            </EndpointConfigProvider>
                                        </WorkflowContextProvider>
                                    </EntityContextProvider>
                                }
                            />

                            <Route
                                path={authenticatedRoutes.captures.details.path}
                            >
                                <Route
                                    path={
                                        authenticatedRoutes.captures.details
                                            .overview.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="overview">
                                            <CaptureDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />

                                <Route
                                    path={
                                        authenticatedRoutes.captures.details
                                            .spec.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="spec">
                                            <CaptureDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />

                                <Route
                                    path={
                                        authenticatedRoutes.captures.details
                                            .history.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="history">
                                            <CaptureDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />
                            </Route>
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
                                    authenticatedRoutes.materializations.create
                                        .path
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
                                    authenticatedRoutes.materializations.edit
                                        .path
                                }
                                element={
                                    <EntityContextProvider value="materialization">
                                        <WorkflowContextProvider value="materialization_edit">
                                            <EndpointConfigProvider>
                                                <EntityExistenceGuard>
                                                    <MaterializationEdit />
                                                </EntityExistenceGuard>
                                            </EndpointConfigProvider>
                                        </WorkflowContextProvider>
                                    </EntityContextProvider>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.materializations.details
                                        .path
                                }
                            >
                                <Route
                                    path={
                                        authenticatedRoutes.materializations
                                            .details.overview.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="overview">
                                            <MaterializationDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />

                                <Route
                                    path={
                                        authenticatedRoutes.materializations
                                            .details.spec.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="spec">
                                            <MaterializationDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />

                                <Route
                                    path={
                                        authenticatedRoutes.materializations
                                            .details.history.path
                                    }
                                    element={
                                        <DetailsPageContextProvider value="history">
                                            <MaterializationDetails />
                                        </DetailsPageContextProvider>
                                    }
                                />
                            </Route>
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
                            <Route
                                path={authenticatedRoutes.admin.cookies.path}
                                element={<AdminCookies />}
                            />
                            <Route
                                path={
                                    authenticatedRoutes.admin.storageMappings
                                        .path
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
                </Route>

                <Route path="/login" element={<Login />} />
            </Route>
        )
    );

    return <RouterProvider router={router} />;
};

export default ApplicationRouter;
