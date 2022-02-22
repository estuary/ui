import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './Context';

const CheckAuth = ({ children }: { children: JSX.Element }) => {
    const auth = useAuth();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.user) {
            if (pathname === '/' || pathname.includes('login')) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate(pathname, { replace: false });
            }
        }
    }, [auth.user, pathname, navigate]);

    return children;
};

export default CheckAuth;
