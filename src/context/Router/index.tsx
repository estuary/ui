import { lazy, Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
    Routes,
} from 'react-router-dom';

import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';
import AccessGrants from 'src/components/admin/AccessGrants';
import AdminApi from 'src/components/admin/Api';
import AdminBilling from 'src/components/admin/Billing';
import AdminConnectors from 'src/components/admin/Connectors';
import Notifications from 'src/components/admin/Notifications';
import AdminSettings from 'src/components/admin/Settings';
import { ErrorImporting } from 'src/components/shared/ErrorImporting';
import { AuthenticatedOnlyContext } from 'src/context/Authenticated';
import { DashboardWelcomeProvider } from 'src/context/DashboardWelcome';
import { EntityContextProvider } from 'src/context/EntityContext';
import Authenticated from 'src/context/Router/Authenticated';
import AuthenticatedLayout from 'src/context/Router/AuthenticatedLayout';
import CapturesTable from 'src/context/Router/CapturesTable';
import MaterializationsTable from 'src/context/Router/MaterializationsTable';
import RequireAuth from 'src/context/Router/RequireAuth';
import { WorkflowContextProvider } from 'src/context/Workflow';
import { OAuthPopup } from 'src/hooks/forks/react-use-oauth2/components';
import Admin from 'src/pages/Admin';
import Auth from 'src/pages/Auth';
import Collections from 'src/pages/Collections';
import DataPlaneAuthReq from 'src/pages/DataPlaneAuthReq';
import TestJsonForms from 'src/pages/dev/TestJsonForms';
import PageNotFound from 'src/pages/error/PageNotFound';
import HomePage from 'src/pages/Home';
import BasicLogin from 'src/pages/login/Basic';
import EnterpriseLogin from 'src/pages/login/Enterprise';
import MarketplaceCallback from 'src/pages/marketplace/Callback';
import MarketplaceVerification from 'src/pages/marketplace/Verification';

// Capture
const CaptureCreateRoute = lazy(
    () => import('src/context/Router/CaptureCreate')
);
const CaptureCreateNewRoute = lazy(
    () => import('src/context/Router/CaptureCreateNew')
);
const CaptureDetailsRoute = lazy(
    () => import('src/context/Router/CaptureDetails')
);
const CaptureEditRoute = lazy(() => import('src/context/Router/CaptureEdit'));
// const ExpressCaptureCreateRoute = lazy(
//     () => import('src/context/Router/ExpressCaptureCreate')
// );
// const ExpressCaptureCreateNewRoute = lazy(
//     () => import('src/context/Router/ExpressCaptureCreateNew')
// );

// Collection
const DerivationCreateComponent = lazy(
    () => import('src/components/derivation/Create')
);
const CollectionCreateRoute = lazy(
    () => import('src/context/Router/CollectionCreate')
);
const CollectionCreateNewRoute = lazy(
    () => import('src/context/Router/CollectionCreateNew')
);
const CollectionDetailsRoute = lazy(
    () => import('src/context/Router/CollectionDetails')
);

//Materializations
const MaterializationCreateRoute = lazy(
    () => import('src/context/Router/MaterializationCreate')
);
const MaterializationCreateNewRoute = lazy(
    () => import('src/context/Router/MaterializationCreateNew')
);
const MaterializationDetailsRoute = lazy(
    () => import('src/context/Router/MaterializationDetails')
);
const MaterializationEditRoute = lazy(
    () => import('src/context/Router/MaterializationEdit')
);

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route
                path={unauthenticatedRoutes.path}
                element={
                    <RequireAuth firstLoad>
                        <BasicLogin />
                    </RequireAuth>
                }
            />

            <Route
                path={unauthenticatedRoutes.login.path}
                element={
                    <RequireAuth firstLoad checkForGrant>
                        <BasicLogin />
                    </RequireAuth>
                }
            />

            <Route
                path={unauthenticatedRoutes.sso.register.fullPath}
                element={
                    <RequireAuth firstLoad checkForGrant>
                        <EnterpriseLogin />
                    </RequireAuth>
                }
            />

            <Route
                path={unauthenticatedRoutes.sso.login.fullPath}
                element={
                    <RequireAuth firstLoad checkForGrant>
                        <EnterpriseLogin />
                    </RequireAuth>
                }
            />

            <Route path={unauthenticatedRoutes.auth.path} element={<Auth />} />
            <Route
                path={unauthenticatedRoutes.magicLink.path}
                element={<Auth />}
            />

            {/*We need a callback that registration can come back to that will properly handle the auth token stuff
                Also this MUST come before the register route down below*/}
            <Route
                path={unauthenticatedRoutes.register.callback.fullPath}
                element={
                    <RequireAuth firstLoad checkForGrant>
                        <BasicLogin />
                    </RequireAuth>
                }
            />

            <Route
                path={unauthenticatedRoutes.marketplace.callback.fullPath}
                element={<MarketplaceCallback />}
            />

            {/*Logout goes directly to login to make sure it isn't wrapped in RequireAuth and won't try to log the user back in*/}
            <Route
                path={unauthenticatedRoutes.logout.path}
                element={<BasicLogin />}
            />
            <Route
                path={unauthenticatedRoutes.register.path}
                element={<BasicLogin showRegistration />}
            />

            {/* <Route
                path={authenticatedRoutes.express.captureCreate.fullPath}
                element={
                    <ErrorBoundary FallbackComponent={ErrorImporting}>
                        <Suspense fallback={null}>
                            <AuthenticatedOnlyContext hideSpinner>
                                <ExpressCaptureCreateRoute />
                            </AuthenticatedOnlyContext>
                        </Suspense>
                    </ErrorBoundary>
                }
            />
            <Route
                path={authenticatedRoutes.express.captureCreate.new.fullPath}
                element={
                    <ErrorBoundary FallbackComponent={ErrorImporting}>
                        <Suspense fallback={null}>
                            <AuthenticatedOnlyContext hideSpinner>
                                <ExpressCaptureCreateNewRoute />
                            </AuthenticatedOnlyContext>
                        </Suspense>
                    </ErrorBoundary>
                }
            /> */}

            {/* This is not in the route below so that it does not include the applayout*/}
            <Route
                path={authenticatedRoutes.oauth.path}
                element={
                    <AuthenticatedOnlyContext hideSpinner>
                        <OAuthPopup />
                    </AuthenticatedOnlyContext>
                }
            />

            {/*Outside normal so we can use a fullpage wrapper and not the normal applayout*/}
            <Route
                path={authenticatedRoutes.marketplace.verify.fullPath}
                element={
                    <Authenticated>
                        <MarketplaceVerification />
                    </Authenticated>
                }
            />

            <Route
                path={authenticatedRoutes.path}
                element={
                    <Suspense fallback={null}>
                        <AuthenticatedLayout />
                    </Suspense>
                }
            >
                <Route>
                    <Route
                        path={authenticatedRoutes.home.path}
                        element={
                            <Suspense fallback={null}>
                                <DashboardWelcomeProvider>
                                    <HomePage />
                                </DashboardWelcomeProvider>
                            </Suspense>
                        }
                    />

                    <Route
                        path={authenticatedRoutes.dataPlaneAuth.path}
                        element={<DataPlaneAuthReq />}
                    />

                    <Route
                        path={authenticatedRoutes.marketplace.verify.fullPath}
                        element={<MarketplaceVerification />}
                    />

                    <Route path={authenticatedRoutes.beta.path}>
                        <Route
                            path=""
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <CollectionCreateRoute />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.beta.new.path}
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <CollectionCreateNewRoute />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />
                    </Route>

                    <Route path={`${authenticatedRoutes.collections.path}/*`}>
                        {/*Check details first as collections create opens as dialog
                            meaning we include the collections table in the element*/}
                        <Route
                            path={authenticatedRoutes.collections.details.path}
                        >
                            <Route
                                path={
                                    authenticatedRoutes.collections.details
                                        .overview.path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <CollectionDetailsRoute tab="overview" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.collections.details.spec
                                        .path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <CollectionDetailsRoute tab="spec" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.collections.details
                                        .history.path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <CollectionDetailsRoute tab="history" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.collections.details.ops
                                        .path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <CollectionDetailsRoute tab="ops" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />
                        </Route>

                        <Route
                            path="*"
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
                                                <ErrorBoundary
                                                    FallbackComponent={
                                                        ErrorImporting
                                                    }
                                                >
                                                    <Suspense fallback={null}>
                                                        <WorkflowContextProvider value="collection_create">
                                                            <DerivationCreateComponent />
                                                        </WorkflowContextProvider>
                                                    </Suspense>
                                                </ErrorBoundary>
                                            }
                                        />
                                    </Routes>
                                </EntityContextProvider>
                            }
                        />
                    </Route>

                    <Route path={authenticatedRoutes.captures.path}>
                        <Route
                            path=""
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <CapturesTable />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.create.path}
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <CaptureCreateRoute />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.create.new.path}
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <CaptureCreateNewRoute />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.captures.edit.path}
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <CaptureEditRoute />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route path={authenticatedRoutes.captures.details.path}>
                            <Route
                                path={
                                    authenticatedRoutes.captures.details
                                        .overview.path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <CaptureDetailsRoute tab="overview" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.captures.details.spec
                                        .path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <CaptureDetailsRoute tab="spec" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.captures.details.history
                                        .path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <CaptureDetailsRoute tab="history" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.captures.details.ops
                                        .path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <CaptureDetailsRoute tab="ops" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />
                        </Route>
                    </Route>

                    <Route path={authenticatedRoutes.materializations.path}>
                        <Route
                            path=""
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <MaterializationsTable />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.create.path
                            }
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <MaterializationCreateRoute />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.create.new
                                    .path
                            }
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <MaterializationCreateNewRoute />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.materializations.edit.path
                            }
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <MaterializationEditRoute />
                                    </Suspense>
                                </ErrorBoundary>
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
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <MaterializationDetailsRoute tab="overview" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.materializations.details
                                        .spec.path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <MaterializationDetailsRoute tab="spec" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.materializations.details
                                        .history.path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <MaterializationDetailsRoute tab="history" />
                                        </Suspense>
                                    </ErrorBoundary>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.materializations.details
                                        .ops.path
                                }
                                element={
                                    <ErrorBoundary
                                        FallbackComponent={ErrorImporting}
                                    >
                                        <Suspense fallback={null}>
                                            <MaterializationDetailsRoute tab="ops" />
                                        </Suspense>
                                    </ErrorBoundary>
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
                            path={authenticatedRoutes.admin.notifications.path}
                            element={
                                <Suspense fallback={null}>
                                    <Notifications />
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
                            path={`${authenticatedRoutes.admin.billing.path}/*`}
                        >
                            <Route
                                path={
                                    authenticatedRoutes.admin.billing.addPayment
                                        .path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <AdminBilling showAddPayment />
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
                        </Route>

                        <Route
                            path={authenticatedRoutes.admin.connectors.path}
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <AdminConnectors />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />
                        <Route
                            path={authenticatedRoutes.admin.billing.path}
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <AdminBilling />
                                    </Suspense>
                                </ErrorBoundary>
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
                            <ErrorBoundary FallbackComponent={ErrorImporting}>
                                <EntityContextProvider value="capture">
                                    <TestJsonForms />
                                </EntityContextProvider>
                            </ErrorBoundary>
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
    return <RouterProvider router={router} />;
};

export default ApplicationRouter;
