import { Skeleton } from '@mui/material';
import AppLayout from 'AppLayout';
import Home from 'pages/Home';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Error from '../pages/Error';

const Admin = lazy(() => import('../pages/Admin'));

const Captures = lazy(() => import('../pages/Captures'));
const CaptureCreation = lazy(() => import('components/capture/creation/index'));

const Materializations = lazy(() => import('../pages/Materializations'));
const NewMaterialization = lazy(
    () => import('../components/materialization/creation')
);

const Collections = lazy(() => import('../pages/Collections'));

const Builds = lazy(() => import('../pages/Builds'));

const Users = lazy(() => import('../pages/Users'));

const Alerts = lazy(() => import('../pages/Alerts'));

const Logs = lazy(() => import('../pages/Logs'));

const Authenticated = () => {
    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/app">
                        <Route path="collections" element={<Collections />} />
                        <Route path="captures" element={<Captures />}>
                            <Route path="new" element={<CaptureCreation />} />
                        </Route>
                        <Route path="derivations" element={<Error />} />
                        <Route
                            path="materializations"
                            element={<Materializations />}
                        >
                            <Route
                                path="new"
                                element={<NewMaterialization />}
                            />
                        </Route>
                        <Route path="builds" element={<Builds />} />
                        <Route path="admin/*" element={<Admin />}>
                            <Route path="logs" element={<Logs />} />
                            <Route path="alerts" element={<Alerts />} />
                            <Route path="users" element={<Users />} />
                        </Route>
                    </Route>
                </Route>
                <Route path="*" element={<Error />} />
            </Routes>
        </Suspense>
    );
};

export default Authenticated;
