import Login from 'pages/Login';
import { Route, Routes } from 'react-router';

export const logoutRoutes = {
    path: 'logout',
    params: {
        reason: 'reason',
    },
};

const Unauthenticated = () => {
    return (
        <Routes>
            <Route
                path={`${logoutRoutes.path}:${logoutRoutes.params.reason}`}
                element={<Login />}
            />
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default Unauthenticated;
