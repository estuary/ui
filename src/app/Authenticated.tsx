import { Collections } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import AppLayout from 'AppLayout';
import CaptureCreate from 'components/capture/create';
import CaptureEdit from 'components/capture/edit';
import NewMaterialization from 'components/materialization/create';
import Admin from 'pages/Admin';
import Builds from 'pages/Builds';
import Captures from 'pages/Captures';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import Materializations from 'pages/Materializations';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

export const homeRoute = {
    title: 'routeTitle.dashboard',
    path: '/',
};

export const pageNotFoundRoute = {
    title: 'routeTitle.error.pageNotFound',
    path: '*',
};

export const adminRoute = {
    title: 'routeTitle.admin',
    path: '/admin',
};

export const buildsRoute = {
    title: 'routeTitle.builds',
    path: '/test/builds',
};

export const captureRoute = {
    root: '/capture',
    create: {
        title: 'routeTitle.captureCreate',
        path: `/capture/create`,
    },
    edit: {
        title: 'routeTitle.captureEdit',
        path: '/capture/edit',
    },
};

export const capturesRoute = {
    title: 'routeTitle.captures',
    path: '/captures',
};

export const collectionsRoute = {
    title: 'routeTitle.collections',
    path: '/collections',
};

export const materializationRoute = {
    root: '/materialization',
    create: {
        title: 'routeTitle.materializationCreate',
        path: 'create',
    },
};

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
                            element={<NewMaterialization />}
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
