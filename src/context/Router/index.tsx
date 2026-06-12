import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';

import { lazy, Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import {
    createBrowserRouter,
    Route,
    RouterProvider,
    Routes,
} from 'react-router-dom';

import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';
import AccessGrants from 'src/components/admin/AccessGrants';
import AdminApi from 'src/components/admin/Api';
import AdminBilling from 'src/components/admin/Billing';
import AdminSettings from 'src/components/admin/Settings';
import { ErrorImporting } from 'src/components/shared/ErrorImporting';
import HasSupportRoleGuard from 'src/components/shared/guards/SupportRole';
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
import GqlExplorer from 'src/pages/dev/gqlExplorer';
import TestJsonForms from 'src/pages/dev/TestJsonForms';
import PageNotFound from 'src/pages/error/PageNotFound';
import HomePage from 'src/pages/Home';
import BasicLogin from 'src/pages/login/Basic';
import EnterpriseLogin from 'src/pages/login/Enterprise';
import MarketplaceCallback from 'src/pages/marketplace/Callback';
import MarketplaceVerification from 'src/pages/marketplace/Verification';
import { SSORequired } from 'src/pages/SSORequired';
import { isProduction } from 'src/utils/env-utils';

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

// Wrap a (typically lazy) route element in a Suspense boundary.
const suspended = (node: ReactNode) => (
    <Suspense fallback={null}>{node}</Suspense>
);

// Wrap a route element in the shared chunk-load error boundary.
const guarded = (node: ReactNode) => (
    <ErrorBoundary FallbackComponent={ErrorImporting}>{node}</ErrorBoundary>
);

// The common case: a lazily-loaded route guarded against chunk-load errors.
const lazyElement = (node: ReactNode) => guarded(suspended(node));

const routes: RouteObject[] = [
    {
        children: [
            {
                path: unauthenticatedRoutes.path,
                element: (
                    <RequireAuth firstLoad>
                        <BasicLogin />
                    </RequireAuth>
                ),
            },
            {
                path: unauthenticatedRoutes.login.path,
                element: (
                    <RequireAuth firstLoad checkForGrant>
                        <BasicLogin />
                    </RequireAuth>
                ),
            },
            {
                path: unauthenticatedRoutes.sso.register.fullPath,
                element: (
                    <RequireAuth firstLoad checkForGrant>
                        <EnterpriseLogin />
                    </RequireAuth>
                ),
            },
            {
                path: unauthenticatedRoutes.sso.login.fullPath,
                element: (
                    <RequireAuth firstLoad checkForGrant>
                        <EnterpriseLogin />
                    </RequireAuth>
                ),
            },
            {
                path: unauthenticatedRoutes.ssoRequired.path,
                element: <SSORequired />,
            },
            { path: unauthenticatedRoutes.auth.path, element: <Auth /> },
            { path: unauthenticatedRoutes.magicLink.path, element: <Auth /> },

            // We need a callback that registration can come back to that will
            // properly handle the auth token stuff. Also this MUST come before
            // the register route down below.
            {
                path: unauthenticatedRoutes.register.callback.fullPath,
                element: (
                    <RequireAuth firstLoad checkForGrant>
                        <BasicLogin />
                    </RequireAuth>
                ),
            },
            {
                path: unauthenticatedRoutes.marketplace.callback.fullPath,
                element: <MarketplaceCallback />,
            },

            // Logout goes directly to login to make sure it isn't wrapped in
            // RequireAuth and won't try to log the user back in.
            {
                path: unauthenticatedRoutes.logout.path,
                element: <BasicLogin />,
            },
            {
                path: unauthenticatedRoutes.register.path,
                element: <BasicLogin showRegistration />,
            },

            // This is not in the route below so that it does not include the
            // applayout.
            {
                path: authenticatedRoutes.oauth.path,
                element: (
                    <AuthenticatedOnlyContext hideSpinner>
                        <OAuthPopup />
                    </AuthenticatedOnlyContext>
                ),
            },

            // Outside normal so we can use a fullpage wrapper and not the normal
            // applayout.
            {
                path: authenticatedRoutes.marketplace.verify.fullPath,
                element: (
                    <Authenticated>
                        <MarketplaceVerification />
                    </Authenticated>
                ),
            },

            {
                path: authenticatedRoutes.path,
                element: suspended(<AuthenticatedLayout />),
                children: [
                    {
                        children: [
                            {
                                path: authenticatedRoutes.home.path,
                                element: suspended(
                                    <DashboardWelcomeProvider>
                                        <HomePage />
                                    </DashboardWelcomeProvider>
                                ),
                            },
                            {
                                path: authenticatedRoutes.dataPlaneAuth.path,
                                element: <DataPlaneAuthReq />,
                            },
                            {
                                path: authenticatedRoutes.marketplace.verify
                                    .fullPath,
                                element: <MarketplaceVerification />,
                            },

                            {
                                path: authenticatedRoutes.beta.path,
                                children: [
                                    {
                                        index: true,
                                        element: lazyElement(
                                            <CollectionCreateRoute />
                                        ),
                                    },
                                    {
                                        path: authenticatedRoutes.beta.new.path,
                                        element: lazyElement(
                                            <CollectionCreateNewRoute />
                                        ),
                                    },
                                ],
                            },

                            {
                                // Splat handled by the `*` child below rather
                                // than a `path: 'collections/*'` parent, per
                                // react-router's v7_relativeSplatPath guidance.
                                path: authenticatedRoutes.collections.path,
                                children: [
                                    // Check details first as collections create
                                    // opens as dialog meaning we include the
                                    // collections table in the element.
                                    {
                                        path: authenticatedRoutes.collections
                                            .details.path,
                                        children: [
                                            {
                                                path: authenticatedRoutes
                                                    .collections.details
                                                    .overview.path,
                                                element: lazyElement(
                                                    <CollectionDetailsRoute tab="overview" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .collections.details.alerts
                                                    .path,
                                                element: lazyElement(
                                                    <CollectionDetailsRoute tab="alerts" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .collections.details.spec
                                                    .path,
                                                element: lazyElement(
                                                    <CollectionDetailsRoute tab="spec" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .collections.details.history
                                                    .path,
                                                element: lazyElement(
                                                    <CollectionDetailsRoute tab="history" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .collections.details.ops
                                                    .path,
                                                element: lazyElement(
                                                    <CollectionDetailsRoute tab="ops" />
                                                ),
                                            },
                                        ],
                                    },
                                    {
                                        path: '*',
                                        element: (
                                            <EntityContextProvider value="collection">
                                                <Collections />
                                                <Routes>
                                                    <Route
                                                        path={
                                                            authenticatedRoutes
                                                                .collections
                                                                .create.new.path
                                                        }
                                                        element={lazyElement(
                                                            <WorkflowContextProvider value="collection_create">
                                                                <DerivationCreateComponent />
                                                            </WorkflowContextProvider>
                                                        )}
                                                    />
                                                </Routes>
                                            </EntityContextProvider>
                                        ),
                                    },
                                ],
                            },

                            {
                                path: authenticatedRoutes.captures.path,
                                children: [
                                    {
                                        index: true,
                                        element: lazyElement(<CapturesTable />),
                                    },
                                    {
                                        path: authenticatedRoutes.captures
                                            .create.path,
                                        element: lazyElement(
                                            <CaptureCreateRoute />
                                        ),
                                    },
                                    {
                                        path: authenticatedRoutes.captures
                                            .create.new.path,
                                        element: lazyElement(
                                            <CaptureCreateNewRoute />
                                        ),
                                    },
                                    {
                                        path: authenticatedRoutes.captures.edit
                                            .path,
                                        element: lazyElement(
                                            <CaptureEditRoute />
                                        ),
                                    },
                                    {
                                        path: authenticatedRoutes.captures
                                            .details.path,
                                        children: [
                                            {
                                                path: authenticatedRoutes
                                                    .captures.details.overview
                                                    .path,
                                                element: lazyElement(
                                                    <CaptureDetailsRoute tab="overview" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .captures.details.alerts
                                                    .path,
                                                element: lazyElement(
                                                    <CaptureDetailsRoute tab="alerts" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .captures.details.spec.path,
                                                element: lazyElement(
                                                    <CaptureDetailsRoute tab="spec" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .captures.details.history
                                                    .path,
                                                element: lazyElement(
                                                    <CaptureDetailsRoute tab="history" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .captures.details.ops.path,
                                                element: lazyElement(
                                                    <CaptureDetailsRoute tab="ops" />
                                                ),
                                            },
                                        ],
                                    },
                                ],
                            },

                            {
                                path: authenticatedRoutes.materializations.path,
                                children: [
                                    {
                                        index: true,
                                        element: lazyElement(
                                            <MaterializationsTable />
                                        ),
                                    },
                                    {
                                        path: authenticatedRoutes
                                            .materializations.create.path,
                                        element: lazyElement(
                                            <MaterializationCreateRoute />
                                        ),
                                    },
                                    {
                                        path: authenticatedRoutes
                                            .materializations.create.new.path,
                                        element: lazyElement(
                                            <MaterializationCreateNewRoute />
                                        ),
                                    },
                                    {
                                        path: authenticatedRoutes
                                            .materializations.edit.path,
                                        element: lazyElement(
                                            <MaterializationEditRoute />
                                        ),
                                    },
                                    {
                                        path: authenticatedRoutes
                                            .materializations.details.path,
                                        children: [
                                            {
                                                path: authenticatedRoutes
                                                    .materializations.details
                                                    .overview.path,
                                                element: lazyElement(
                                                    <MaterializationDetailsRoute tab="overview" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .materializations.details
                                                    .alerts.path,
                                                element: lazyElement(
                                                    <MaterializationDetailsRoute tab="alerts" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .materializations.details
                                                    .spec.path,
                                                element: lazyElement(
                                                    <MaterializationDetailsRoute tab="spec" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .materializations.details
                                                    .history.path,
                                                element: lazyElement(
                                                    <MaterializationDetailsRoute tab="history" />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes
                                                    .materializations.details
                                                    .ops.path,
                                                element: lazyElement(
                                                    <MaterializationDetailsRoute tab="ops" />
                                                ),
                                            },
                                        ],
                                    },
                                ],
                            },

                            {
                                path: authenticatedRoutes.admin.path,
                                children: [
                                    {
                                        index: true,
                                        element: suspended(<Admin />),
                                    },
                                    {
                                        path: authenticatedRoutes.admin
                                            .accessGrants.path,
                                        element: suspended(<AccessGrants />),
                                    },
                                    {
                                        path: authenticatedRoutes.admin.api
                                            .path,
                                        element: suspended(<AdminApi />),
                                    },
                                    {
                                        path: authenticatedRoutes.admin.billing
                                            .path,
                                        children: [
                                            {
                                                index: true,
                                                element: lazyElement(
                                                    <AdminBilling />
                                                ),
                                            },
                                            {
                                                path: authenticatedRoutes.admin
                                                    .billing.addPayment.path,
                                                element: lazyElement(
                                                    <AdminBilling
                                                        showAddPayment
                                                    />
                                                ),
                                            },
                                        ],
                                    },
                                    {
                                        path: authenticatedRoutes.admin.settings
                                            .path,
                                        element: suspended(<AdminSettings />),
                                    },
                                ],
                            },

                            {
                                path: 'test',
                                children: [
                                    {
                                        path: 'jsonforms',
                                        element: guarded(
                                            <HasSupportRoleGuard>
                                                <EntityContextProvider value="capture">
                                                    <TestJsonForms />
                                                </EntityContextProvider>
                                            </HasSupportRoleGuard>
                                        ),
                                    },
                                    ...(!isProduction
                                        ? [
                                              {
                                                  path: 'gql',
                                                  element: guarded(
                                                      <GqlExplorer />
                                                  ),
                                              },
                                          ]
                                        : []),
                                ],
                            },

                            {
                                path: authenticatedRoutes.pageNotFound.path,
                                element: <PageNotFound />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

// Opt into v7 behavior while still on v6 so the v7 package swap is a no-op.
// These all become defaults in v7 (and are removed at that point).
// Note: v7_startTransition is a RouterProvider prop, not a router option.
const router = createBrowserRouter(routes, {
    future: {
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
    },
});

const ApplicationRouter = () => {
    return (
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
    );
};

export default ApplicationRouter;
