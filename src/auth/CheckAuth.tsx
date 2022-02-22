import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuthHeader } from '../services/axios';
import { useAuth } from './Context';

const CheckAuth = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setAuthHeader(user);
            if (pathname === '/' || pathname.includes('login')) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate(pathname, { replace: false });
            }
        }

        // This is kind of hacky partially due to : https://github.com/remix-run/react-router/issues/7634
        //   but also because we really only want to do this on the first navigation or if the user changed.
        //   So we use other variables but do not check them in this list.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return children;
};

export default CheckAuth;
