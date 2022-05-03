import Login from 'pages/Login';
import { Route, Routes } from 'react-router';

const Unauthenticated = () => {
    return (
        <Routes>
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default Unauthenticated;
