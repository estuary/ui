import { authenticatedRoutes, unauthenticatedRoutes } from 'app/routes';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { OAuthPopup } from 'hooks/forks/react-use-oauth2/components';
import useBrowserTitle from 'hooks/useBrowserTitle';
import Auth from 'pages/Auth';
import Collections from 'pages/Collections';
import DataPlaneAuthReq from 'pages/DataPlaneAuthReq';
import TestJsonForms from 'pages/dev/TestJsonForms';
import PageNotFound from 'pages/error/PageNotFound';
import Login from 'pages/Login';
import { lazy, Suspense } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
    Routes,
} from 'react-router-dom';
import RequireAuth from './RequireAuth';

const Authenticated = lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);
const HomePage = lazy(() => import(/* webpackPrefetch: true */ 'pages/Home'));

// Capture
const CaptureCreateRoute = lazy(
    () => import(/* webpackPrefetch: true */ './CaptureCreate')
);
const CaptureCreateNewRoute = lazy(
    () => import(/* webpackPrefetch: true */ './CaptureCreateNew')
);
const CaptureDetailsRoute = lazy(
    () => import(/* webpackPrefetch: true */ './CaptureDetails')
);
const CaptureEditRoute = lazy(
    () => import(/* webpackPrefetch: true */ './CaptureEdit')
);
const CapturesTable = lazy(
    () => import(/* webpackPrefetch: true */ './CapturesTable')
);

// Collection
const DerivationCreateComponent = lazy(
    () => import(/* webpackPrefetch: true */ 'components/derivation/Create')
);
const CollectionDetailsRoute = lazy(
    () => import(/* webpackPrefetch: true */ './CollectionDetails')
);

//Materializations
const MaterializationCreateRoute = lazy(
    () => import(/* webpackPrefetch: true */ './MaterializationCreate')
);
const MaterializationCreateNewRoute = lazy(
    () => import(/* webpackPrefetch: true */ './MaterializationCreateNew')
);
const MaterializationDetailsRoute = lazy(
    () => import(/* webpackPrefetch: true */ './MaterializationDetails')
);
const MaterializationEditRoute = lazy(
    () => import(/* webpackPrefetch: true */ './MaterializationEdit')
);
const MaterializationsTable = lazy(
    () => import(/* webpackPrefetch: true */ './MaterializationsTable')
);

//Admin
const Admin = lazy(() => import(/* webpackPrefetch: true */ 'pages/Admin'));
const AccessGrants = lazy(
    () => import(/* webpackPrefetch: true */ 'components/admin/AccessGrants')
);
const AdminApi = lazy(
    () => import(/* webpackPrefetch: true */ 'components/admin/Api')
);
const AdminConnectors = lazy(
    () => import(/* webpackPrefetch: true */ 'components/admin/Connectors')
);
const AdminBilling = lazy(
    () => import(/* webpackPrefetch: true */ 'components/admin/Billing')
);
const AdminSettings = lazy(
    () => import(/* webpackPrefetch: true */ 'components/admin/Settings')
);

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route
                path={unauthenticatedRoutes.path}
                element={
                    <RequireAuth firstLoad>
                        <Login />
                    </RequireAuth>
                }
            />

            <Route
                path={unauthenticatedRoutes.login.path}
                element={
                    <RequireAuth firstLoad>
                        <Login />
                    </RequireAuth>
                }
            />

            <Route path={unauthenticatedRoutes.auth.path} element={<Auth />} />
            <Route
                path={unauthenticatedRoutes.magicLink.path}
                element={<Auth />}
            />

            {/*Logout goes directly to login to make sure it isn't wrapped in RequireAuth and won't try to log the user back in*/}
            <Route
                path={unauthenticatedRoutes.logout.path}
                element={<Login />}
            />
            <Route
                path={unauthenticatedRoutes.register.path}
                element={<Login showRegistration />}
            />

            {/* This is not in the route below so that it does not include the applayout*/}
            <Route
                path={authenticatedRoutes.oauth.path}
                element={
                    <AuthenticatedOnlyContext>
                        <OAuthPopup />
                    </AuthenticatedOnlyContext>
                }
            />

            <Route
                path={authenticatedRoutes.path}
                element={
                    <Suspense fallback={null}>
                        <Authenticated />
                    </Suspense>
                }
            >
                <Route>
                    <Route
                        path={authenticatedRoutes.home.path}
                        element={
                            <Suspense fallback={null}>
                                <HomePage />
                            </Suspense>
                        }
                    />

                    <Route
                        path={authenticatedRoutes.dataPlaneAuth.path}
                        element={<DataPlaneAuthReq />}
                    />

                    <Route
                        path={`${authenticatedRoutes.collections.path}/*`}
                        element={
                            <EntityContextProvider value="collection">
                                <Collections />
                                <Routes>
                                    <Route
                                        path={
                                            authenticatedRoutes.collections
                                                .create.new.path
                                        }
                                        element={
                                            <Suspense fallback={null}>
                                                <WorkflowContextProvider value="collection_create">
                                                    <DerivationCreateComponent />
                                                </WorkflowContextProvider>
                                            </Suspense>
                                        }
                                    />

                                    <Route
                                        path={
                                            authenticatedRoutes.collections
                                                .details.path
                                        }
                                    >
                                        <Route
                                            path={
                                                authenticatedRoutes.collections
                                                    .details.overview.path
                                            }
                                            element={
                                                <Suspense fallback={null}>
                                                    <CollectionDetailsRoute tab="overview" />
                                                </Suspense>
                                            }
                                        />

                                        <Route
                                            path={
                                                authenticatedRoutes.collections
                                                    .details.spec.path
                                            }
                                            element={
                                                <Suspense fallback={null}>
                                                    <CollectionDetailsRoute tab="spec" />
                                                </Suspense>
                                            }
                                        />

                                        <Route
                                            path={
                                                authenticatedRoutes.collections
                                                    .details.history.path
                                            }
                                            element={
                                                <Suspense fallback={null}>
                                                    <CollectionDetailsRoute tab="history" />
                                                </Suspense>
                                            }
                                        />
                                    </Route>
                                </Routes>
                            </EntityContextProvider>
                        }
                    />

                    <Route path={authenticatedRoutes.captures.path}>
                        <Route
                            path=""
                            element={
                                <Suspense fallback={null}>
                                    <CapturesTable />
                                </Suspense>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.create.path}
                            element={
                                <Suspense fallback={null}>
                                    <CaptureCreateRoute />
                                </Suspense>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.create.new.path}
                            element={
                                <Suspense fallback={null}>
                                    <CaptureCreateNewRoute />
                                </Suspense>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.edit.path}
                            element={
                                <Suspense fallback={null}>
                                    <CaptureEditRoute />
                                </Suspense>
                            }
                        />

                        <Route path={authenticatedRoutes.captures.details.path}>
                            <Route
                                path={
                                    authenticatedRoutes.captures.details
                                        .overview.path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <CaptureDetailsRoute tab="overview" />
                                    </Suspense>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.captures.details.spec
                                        .path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <CaptureDetailsRoute tab="spec" />
                                    </Suspense>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.captures.details.history
                                        .path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <CaptureDetailsRoute tab="history" />
                                    </Suspense>
                                }
                            />
                        </Route>
                    </Route>

                    <Route path={authenticatedRoutes.materializations.path}>
                        <Route
                            path=""
                            element={
                                <Suspense fallback={null}>
                                    <MaterializationsTable />
                                </Suspense>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.create.path
                            }
                            element={
                                <Suspense fallback={null}>
                                    <MaterializationCreateRoute />
                                </Suspense>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.create.new
                                    .path
                            }
                            element={
                                <Suspense fallback={null}>
                                    <MaterializationCreateNewRoute />
                                </Suspense>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.edit.path
                            }
                            element={
                                <Suspense fallback={null}>
                                    <MaterializationEditRoute />
                                </Suspense>
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
                                    authenticatedRoutes.materializations.details
                                        .overview.path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <MaterializationDetailsRoute tab="overview" />
                                    </Suspense>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.materializations.details
                                        .spec.path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <MaterializationDetailsRoute tab="spec" />
                                    </Suspense>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.materializations.details
                                        .history.path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <MaterializationDetailsRoute tab="history" />
                                    </Suspense>
                                }
                            />
                        </Route>
                    </Route>

                    <Route path={authenticatedRoutes.admin.path}>
                        <Route
                            path=""
                            element={
                                <Suspense fallback={null}>
                                    <Admin />
                                </Suspense>
                            }
                        />
                        <Route
                            path={authenticatedRoutes.admin.accessGrants.path}
                            element={
                                <Suspense fallback={null}>
                                    <AccessGrants />
                                </Suspense>
                            }
                        />
                        <Route
                            path={authenticatedRoutes.admin.api.path}
                            element={
                                <Suspense fallback={null}>
                                    <AdminApi />
                                </Suspense>
                            }
                        />
                        <Route
                            path={authenticatedRoutes.admin.billing.path}
                            element={
                                <Suspense fallback={null}>
                                    <AdminBilling />
                                </Suspense>
                            }
                        />
                        <Route
                            path={authenticatedRoutes.admin.connectors.path}
                            element={
                                <Suspense fallback={null}>
                                    <AdminConnectors />
                                </Suspense>
                            }
                        />
                        <Route
                            path={authenticatedRoutes.admin.billing.path}
                            element={
                                <Suspense fallback={null}>
                                    <AdminBilling />
                                </Suspense>
                            }
                        />
                        <Route
                            path={authenticatedRoutes.admin.settings.path}
                            element={
                                <Suspense fallback={null}>
                                    <AdminSettings />
                                </Suspense>
                            }
                        />
                    </Route>

                    <Route
                        path="test/jsonforms"
                        element={
                            <EntityContextProvider value="capture">
                                <TestJsonForms />
                            </EntityContextProvider>
                        }
                    />

                    <Route
                        path={authenticatedRoutes.pageNotFound.path}
                        element={<PageNotFound />}
                    />
                </Route>
            </Route>
        </Route>
    )
);

const ApplicationRouter = () => {
    useBrowserTitle('routeTitle.loginLoading');

    return <RouterProvider router={router} />;
};

export default ApplicationRouter;
