import Auth from 'pages/Auth';
import Login from 'pages/Login';
import { Route, Routes } from 'react-router';
import { unauthenticatedRoutes } from './routes';

const Unauthenticated = () => {
    return (
        <Routes>
            <Route path={unauthenticatedRoutes.auth.path} element={<Auth />} />
            <Route
                path={unauthenticatedRoutes.magicLink.path}
                element={<Auth />}
            />
            <Route
                path={unauthenticatedRoutes.register.path}
                element={<Login showRegistration={true} />}
            />
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default Unauthenticated;
