import { Skeleton } from '@mui/material';
import AppLayout from 'AppLayout';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import { lazy, Suspense } from 'react';
import { RouteObject, useRoutes } from 'react-router';

const Admin = lazy(() => import('../pages/Admin'));

const Builds = lazy(() => import('../pages/Builds'));

const Captures = lazy(() => import('../pages/Captures'));
const CaptureCreate = lazy(() => import('components/capture/create/index'));
const CaptureEdit = lazy(() => import('components/capture/edit/index'));

const Materializations = lazy(() => import('../pages/Materializations'));
const MaterializationCreate = lazy(
    () => import('../components/materialization/create')
);

const Collections = lazy(() => import('../pages/Collections'));

const routes: RouteObject[] = [
    {
        path: '',
        element: <AppLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/test/builds',
                element: <Builds />,
            },
            {
                path: '/dashboard',
                element: <Home />,
            },
            {
                path: '/collections',
                element: <Collections />,
            },
            {
                path: '/captures',
                element: <Captures />,
            },
            {
                path: '/capture',
                children: [
                    {
                        path: 'create',
                        element: <CaptureCreate />,
                    },
                    {
                        path: 'edit',
                        element: <CaptureEdit />,
                    },
                ],
            },
            {
                path: '/materializations',
                element: <Materializations />,
            },
            {
                path: '/materialization',
                children: [
                    {
                        path: 'create',
                        element: <MaterializationCreate />,
                    },
                ],
            },
            {
                path: '/admin',
                element: <Admin />,
            },
            {
                path: '*',
                element: <PageNotFound />,
            },
        ],
    },
];

const Authenticated = () => {
    const RoutesElement = useRoutes(routes);

    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            {RoutesElement}
        </Suspense>
    );
};

export default Authenticated;
