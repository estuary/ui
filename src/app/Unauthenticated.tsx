import { Skeleton } from '@mui/material';
import Login from 'pages/Login';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Unauthenticated = () => {
    return (
        <Suspense fallback={<Skeleton animation="wave" />}>
            <Routes>
                <Route path="*" element={<Login />} />
            </Routes>
        </Suspense>
    );
};

export default Unauthenticated;
