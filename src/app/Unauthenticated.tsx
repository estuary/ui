import Login from 'pages/Login';
import { Route, Routes } from 'react-router';

export const logoutRoutes = {
    path: 'logout',
};

const Unauthenticated = () => {
    return (
        <Routes>
            <Route path={logoutRoutes.path} element={<Login />} />
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default Unauthenticated;
