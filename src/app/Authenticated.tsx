import { Skeleton } from '@mui/material';
import AppLayout from 'AppLayout';
import Home from 'pages/Home';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { supabase } from 'services/supabase';
import { SwrSupabaseContext } from 'supabase-swr';
import Error from '../pages/Error';

const Admin = lazy(() => import('../pages/Admin'));

const Builds = lazy(() => import('../pages/Builds'));

const Captures = lazy(() => import('../pages/Captures'));
const CaptureCreate = lazy(() => import('components/capture/create/index'));

const Materializations = lazy(() => import('../pages/Materializations'));
const MaterializationCreate = lazy(
    () => import('../components/materialization/create')
);

const Collections = lazy(() => import('../pages/Collections'));

const Authenticated = () => {
    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            <SwrSupabaseContext.Provider value={supabase}>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/test/builds" element={<Builds />} />
                        <Route path="/dashboard" element={<Home />} />
                        <Route path="collections" element={<Collections />} />
                        <Route path="captures" element={<Captures />} />
                        <Route path="capture">
                            <Route path="create" element={<CaptureCreate />} />
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
                    </Route>
                    <Route path="*" element={<Error />} />
                </Routes>
            </SwrSupabaseContext.Provider>
        </Suspense>
    );
};

export default Authenticated;
