import { Skeleton } from '@mui/material';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Login = lazy(() => import('../pages/Login'));
const Registration = lazy(() => import('../pages/Registration'));

const Unauthenticated = () => {
    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            <Routes>
                <Route path="register" element={<Registration />} />
                <Route path="*" element={<Login />} />
            </Routes>
        </Suspense>
    );
};

export default Unauthenticated;
