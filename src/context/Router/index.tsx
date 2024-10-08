import { authenticatedRoutes, unauthenticatedRoutes } from 'app/routes';
import AccessGrants from 'components/admin/AccessGrants';
import AdminApi from 'components/admin/Api';
import AdminBilling from 'components/admin/Billing';
import AdminConnectors from 'components/admin/Connectors';
import AdminSettings from 'components/admin/Settings';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import { DashboardWelcomeProvider } from 'context/DashboardWelcome';
import { EntityContextProvider } from 'context/EntityContext';
import { WorkflowContextProvider } from 'context/Workflow';
import { OAuthPopup } from 'hooks/forks/react-use-oauth2/components';
import Admin from 'pages/Admin';
import Auth from 'pages/Auth';
import Collections from 'pages/Collections';
import DataPlaneAuthReq from 'pages/DataPlaneAuthReq';
import HomePage from 'pages/Home';
import TestJsonForms from 'pages/dev/TestJsonForms';
import PageNotFound from 'pages/error/PageNotFound';
import BasicLogin from 'pages/login/Basic';
import EnterpriseLogin from 'pages/login/Enterprise';
import MarketplaceCallback from 'pages/marketplace/Callback';
import MarketplaceVerification from 'pages/marketplace/Verification';
import { Suspense } from 'react';
import {
    Route,
    RouterProvider,
    Routes,
    createBrowserRouter,
    createRoutesFromElements,
} from 'react-router-dom';
import { handledLazy } from 'services/react';
import Authenticated from './Authenticated';
import AuthenticatedLayout from './AuthenticatedLayout';
import CapturesTable from './CapturesTable';
import MaterializationsTable from './MaterializationsTable';
import RequireAuth from './RequireAuth';

// Capture
const CaptureCreateRoute = handledLazy(() => import('./CaptureCreate'));
const CaptureCreateNewRoute = handledLazy(() => import('./CaptureCreateNew'));
const CaptureDetailsRoute = handledLazy(() => import('./CaptureDetails'));
const CaptureEditRoute = handledLazy(() => import('./CaptureEdit'));

// Collection
const DerivationCreateComponent = handledLazy(
    () => import('components/derivation/Create')
);
const CollectionCreateRoute = handledLazy(() => import('./CollectionCreate'));
const CollectionCreateNewRoute = handledLazy(
    () => import('./CollectionCreateNew')
);
const CollectionDetailsRoute = handledLazy(() => import('./CollectionDetails'));

//Materializations
const MaterializationCreateRoute = handledLazy(
    () => import('./MaterializationCreate')
);
const MaterializationCreateNewRoute = handledLazy(
    () => import('./MaterializationCreateNew')
);
const MaterializationDetailsRoute = handledLazy(
    () => import('./MaterializationDetails')
);
const MaterializationEditRoute = handledLazy(
    () => import('./MaterializationEdit')
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
                                <Suspense fallback={null}>
                                    <CollectionCreateRoute />
                                </Suspense>
                            }
                        />

                        <Route
                            path={authenticatedRoutes.beta.new.path}
                            element={
                                <Suspense fallback={null}>
                                    <CollectionCreateNewRoute />
                                </Suspense>
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
                                    <Suspense fallback={null}>
                                        <CollectionDetailsRoute tab="overview" />
                                    </Suspense>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.collections.details.spec
                                        .path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <CollectionDetailsRoute tab="spec" />
                                    </Suspense>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.collections.details
                                        .history.path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <CollectionDetailsRoute tab="history" />
                                    </Suspense>
                                }
                            />

                            <Route
                                path={
                                    authenticatedRoutes.collections.details.ops
                                        .path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <CollectionDetailsRoute tab="ops" />
                                    </Suspense>
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
                                                <Suspense fallback={null}>
                                                    <WorkflowContextProvider value="collection_create">
                                                        <DerivationCreateComponent />
                                                    </WorkflowContextProvider>
                                                </Suspense>
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

                            <Route
                                path={
                                    authenticatedRoutes.captures.details.ops
                                        .path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <CaptureDetailsRoute tab="ops" />
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

                            <Route
                                path={
                                    authenticatedRoutes.materializations.details
                                        .ops.path
                                }
                                element={
                                    <Suspense fallback={null}>
                                        <MaterializationDetailsRoute tab="ops" />
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
    return <RouterProvider router={router} />;
};

export default ApplicationRouter;
