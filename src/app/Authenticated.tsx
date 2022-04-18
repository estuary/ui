import { Skeleton } from '@mui/material';
import AppLayout from 'AppLayout';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

export const homeRoute = {
    title: 'routeTitle.dashboard',
    path: '/',
};

export const pageNotFoundRoute = {
    title: 'routeTitle.error.pageNotFound',
    path: '*',
};

const Admin = lazy(() => import('../pages/Admin'));
export const adminRoute = {
    title: 'routeTitle.admin',
    path: '/admin',
};

const Builds = lazy(() => import('../pages/Builds'));
export const buildsRoute = {
    title: 'routeTitle.builds',
    path: '/test/builds',
};

const CaptureCreate = lazy(() => import('components/capture/create/index'));
const CaptureEdit = lazy(() => import('components/capture/edit/index'));
export const captureRoute = {
    root: '/capture',
    create: {
        title: 'routeTitle.captureCreate',
        path: 'create',
    },
    edit: {
        title: 'routeTitle.captureEdit',
        path: 'edit',
    },
};

const Captures = lazy(() => import('../pages/Captures'));
export const capturesRoute = {
    title: 'routeTitle.captures',
    path: '/captures',
};

const Collections = lazy(() => import('../pages/Collections'));
export const collectionsRoute = {
    title: 'routeTitle.collections',
    path: '/collections',
};

const MaterializationCreate = lazy(
    () => import('../components/materialization/create')
);
export const materializationRoute = {
    root: '/materialization',
    create: {
        title: 'routeTitle.materializationCreate',
        path: 'create',
    },
};

const Materializations = lazy(() => import('../pages/Materializations'));
export const materializationsRoute = {
    title: 'routeTitle.materializations',
    path: '/materializations',
};

const Authenticated = () => {
    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path={homeRoute.path} element={<Home />} />
                    <Route path={buildsRoute.path} element={<Builds />} />
                    <Route
                        path={collectionsRoute.path}
                        element={<Collections />}
                    />

                    <Route path={capturesRoute.path} element={<Captures />} />
                    <Route path={captureRoute.root}>
                        <Route
                            path={captureRoute.create.path}
                            element={<CaptureCreate />}
                        />
                        <Route
                            path={captureRoute.edit.path}
                            element={<CaptureEdit />}
                        />
                    </Route>

                    <Route
                        path={materializationsRoute.path}
                        element={<Materializations />}
                    />
                    <Route path={materializationRoute.root}>
                        <Route
                            path={materializationRoute.create.path}
                            element={<MaterializationCreate />}
                        />
                    </Route>

                    <Route path={adminRoute.path} element={<Admin />} />
                    <Route
                        path={pageNotFoundRoute.path}
                        element={<PageNotFound />}
                    />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default Authenticated;
