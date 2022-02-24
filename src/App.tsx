import { Skeleton } from '@mui/material';
import AppLayout from 'AppLayout';
import RequireAuth from 'auth/RequireAuth';
import Home from 'pages/Home';
import Login from 'pages/Login';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import CheckAuth from './auth/CheckAuth';
import Error from './pages/Error';

const Admin = lazy(() => import('./pages/Admin'));

const Capture = lazy(() => import('./pages/Captures'));
const NewCaptureModal = lazy(() => import('components/capture/creation/index'));

const Materializations = lazy(() => import('./pages/Materializations'));
const NewMaterialization = lazy(
    () => import('./components/materialization/creation')
);

const Collections = lazy(() => import('./pages/Collections'));

const Users = lazy(() => import('./pages/Users'));

const Alerts = lazy(() => import('./pages/Alerts'));

const Logs = lazy(() => import('./pages/Logs'));

const App = () => {
    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            <CheckAuth>
                <Routes>
                    {
                        // TODO - do we need the default path to use a "redirector"/"landing" page kind of thing?
                    }
                    <Route path="" element={<Login />} />
                    <Route path="login/*">
                        <Route path="" element={<Login />} />
                    </Route>

                    <Route
                        element={
                            <RequireAuth>
                                <AppLayout />
                            </RequireAuth>
                        }
                    >
                        <Route path="/dashboard" element={<Home />} />
                        <Route path="/app">
                            <Route
                                path="collections"
                                element={<Collections />}
                            />
                            <Route path="captures" element={<Capture />}>
                                <Route
                                    path="new"
                                    element={<NewCaptureModal />}
                                />
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
                            <Route path="admin/*" element={<Admin />}>
                                <Route path="logs" element={<Logs />} />
                                <Route path="alerts" element={<Alerts />} />
                                <Route path="users" element={<Users />} />
                            </Route>
                        </Route>
                    </Route>
                    <Route path="*" element={<Error />} />
                </Routes>
            </CheckAuth>
        </Suspense>
    );
};

export default App;
