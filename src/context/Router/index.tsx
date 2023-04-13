import { authenticatedRoutes, unauthenticatedRoutes } from 'app/routes';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import { EntityContextProvider } from 'context/EntityContext';
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
import { isProduction } from 'utils/env-utils';
import RequireAuth from './RequireAuth';

const Authenticated = lazy(() => import('./Authenticated'));
const HomePage = lazy(() => import('pages/Home'));

// Capture
const CaptureCreateRoute = lazy(() => import('./CaptureCreate'));
const CaptureCreateNewRoute = lazy(() => import('./CaptureCreateNew'));
const CaptureDetailsRoute = lazy(() => import('./CaptureDetails'));
const CaptureEditRoute = lazy(() => import('./CaptureEdit'));
const CapturesTable = lazy(() => import('./CapturesTable'));

// Collection
const DerivationCreateComponent = lazy(
    () => import('components/derivation/Create')
);
const CollectionDetailsRoute = lazy(() => import('./CollectionDetails'));

//Materializations
const MaterializationCreateRoute = lazy(
    () => import('./MaterializationCreate')
);
const MaterializationCreateNewRoute = lazy(
    () => import('./MaterializationCreateNew')
);
const MaterializationDetailsRoute = lazy(
    () => import('./MaterializationDetails')
);
const MaterializationEditRoute = lazy(() => import('./MaterializationEdit'));
const MaterializationsTable = lazy(() => import('./MaterializationsTable'));

//Admin
const Admin = lazy(() => import('pages/Admin'));
const AccessGrants = lazy(() => import('components/admin/AccessGrants'));
const AdminApi = lazy(() => import('components/admin/Api'));
const AdminConnectors = lazy(() => import('components/admin/Connectors'));
const AdminCookies = lazy(() => import('components/admin/Cookies'));
const StorageMappings = lazy(() => import('components/admin/StorageMappings'));

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
                                                <DerivationCreateComponent />
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
                            path={authenticatedRoutes.admin.connectors.path}
                            element={
                                <Suspense fallback={null}>
                                    <AdminConnectors />
                                </Suspense>
                            }
                        />
                        <Route
                            path={authenticatedRoutes.admin.cookies.path}
                            element={
                                <Suspense fallback={null}>
                                    <AdminCookies />
                                </Suspense>
                            }
                        />
                        <Route
                            path={
                                authenticatedRoutes.admin.storageMappings.path
                            }
                            element={
                                <Suspense fallback={null}>
                                    <StorageMappings />
                                </Suspense>
                            }
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
        </Route>
    )
);

const ApplicationRouter = () => {
    useBrowserTitle('browserTitle.loginLoading');

    return <RouterProvider router={router} />;
};

export default ApplicationRouter;
