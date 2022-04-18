import { Skeleton } from '@mui/material';
import AppLayout from 'AppLayout';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

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

const Authenticated = () => {
    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/test/builds" element={<Builds />} />
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="collections" element={<Collections />} />
                    <Route path="captures" element={<Captures />} />
                    <Route path="capture">
                        <Route path="create" element={<CaptureCreate />} />
                        <Route path="edit" element={<CaptureEdit />} />
                    </Route>

                    <Route
                        path="materializations"
                        element={<Materializations />}
                    />
                    <Route path="materialization">
                        <Route
                            path="create"
                            element={<MaterializationCreate />}
                        />
                    </Route>
                    <Route path="admin/*" element={<Admin />} />
                    <Route path="builds" element={<Builds />} />
                </Route>
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </Suspense>
    );
};

export default Authenticated;
