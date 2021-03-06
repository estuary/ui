import Auth from 'pages/Auth';
import Login from 'pages/Login';
import { Route, Routes } from 'react-router';

export const unauthenticatedRoutes = {
    path: '',
    auth: {
        path: '/auth',
    },
    magicLink: {
        path: '/magicLink',
    },
};

const Unauthenticated = () => {
    return (
        <Routes>
            <Route path={unauthenticatedRoutes.auth.path} element={<Auth />} />
            <Route
                path={unauthenticatedRoutes.magicLink.path}
                element={<Auth />}
            />
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default Unauthenticated;
