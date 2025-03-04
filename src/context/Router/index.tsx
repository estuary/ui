import { authenticatedRoutes, unauthenticatedRoutes } from 'app/routes';
import AccessGrants from 'components/admin/AccessGrants';
import AdminApi from 'components/admin/Api';
import AdminBilling from 'components/admin/Billing';
import AdminConnectors from 'components/admin/Connectors';
import AdminSettings from 'components/admin/Settings';
import { ErrorImporting } from 'components/shared/ErrorImporting';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import { DashboardWelcomeProvider } from 'context/DashboardWelcome';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { OAuthPopup } from 'hooks/forks/react-use-oauth2/components';
import Admin from 'pages/Admin';
import Auth from 'pages/Auth';
import Collections from 'pages/Collections';
import DataPlaneAuthReq from 'pages/DataPlaneAuthReq';
import TestJsonForms from 'pages/dev/TestJsonForms';
import PageNotFound from 'pages/error/PageNotFound';
import HomePage from 'pages/Home';
import BasicLogin from 'pages/login/Basic';
import EnterpriseLogin from 'pages/login/Enterprise';
import MarketplaceCallback from 'pages/marketplace/Callback';
import MarketplaceVerification from 'pages/marketplace/Verification';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
    Routes,
} from 'react-router-dom';
import Authenticated from './Authenticated';
import AuthenticatedLayout from './AuthenticatedLayout';
import CapturesTable from './CapturesTable';
import MaterializationsTable from './MaterializationsTable';
import RequireAuth from './RequireAuth';

// Capture
const CaptureCreateRoute = lazy(() => import('./CaptureCreate'));
const CaptureCreateNewRoute = lazy(() => import('./CaptureCreateNew'));
const CaptureExpressCreateRoute = lazy(() => import('./CaptureExpressCreate'));
const CaptureExpressCreateNewRoute = lazy(
    () => import('./CaptureExpressCreateNew')
);
const CaptureDetailsRoute = lazy(() => import('./CaptureDetails'));
const CaptureEditRoute = lazy(() => import('./CaptureEdit'));

// Collection
const DerivationCreateComponent = lazy(
    () => import('components/derivation/Create')
);
const CollectionCreateRoute = lazy(() => import('./CollectionCreate'));
const CollectionCreateNewRoute = lazy(() => import('./CollectionCreateNew'));
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
                            path={
                                authenticatedRoutes.captures.createExpress.path
                            }
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <CaptureExpressCreateRoute />
                                    </Suspense>
                                </ErrorBoundary>
                            }
                        />

                        <Route
                            path={
                                authenticatedRoutes.captures.createExpress.new
                                    .path
                            }
                            element={
                                <ErrorBoundary
                                    FallbackComponent={ErrorImporting}
                                >
                                    <Suspense fallback={null}>
                                        <CaptureExpressCreateNewRoute />
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
