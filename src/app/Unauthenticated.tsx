import { lazy } from 'react';
import { Route, Routes } from 'react-router';

const Login = lazy(() => import('../pages/Login'));
const Registration = lazy(() => import('../pages/Registration'));

const Unauthenticated = () => {
    return (
        <Routes>
            <Route path="register" element={<Registration />} />
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default Unauthenticated;
