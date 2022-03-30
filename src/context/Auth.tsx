import FullPageSpinner from 'components/fullPage/Spinner';
import isFuture from 'date-fns/isFuture';
import { useAsync } from 'hooks/useAsync';
import React, { useCallback, useMemo } from 'react';
import FullPageError from '../components/fullPage/Error';
import { auth } from '../services/auth';

export interface AuthContextType {
    login: (username: string) => Promise<void>;
    logout: () => Promise<void>;
    user: string | null;
}

export async function bootstrapUser() {
    let user = null;

    console.log('Bootstrapping user here');

    const authDetails = auth.getAuthDetails();

    if (authDetails?.session) {
        if (isFuture(new Date(authDetails.session.expires_at))) {
            user = authDetails.user?.display_name;
        } else {
            user = null;
        }
    }

    // const foo = await auth.fetchAuthTokens();

    // console.log('Fetched tokens', foo);

    return user;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);
AuthContext.displayName = 'AuthContext';

export const AuthProvider = (props: any) => {
    const {
        data: user,
        error,
        isError,
        isIdle,
        isLoading,
        isSuccess,
        run,
        setData,
        setError,
        status,
    } = useAsync<string | null>();

    React.useEffect(() => {
        const appDataPromise = bootstrapUser();
        run(appDataPromise);
    }, [run]);

    const login = useCallback(
        (newUser: string) => {
            return auth
                .signin(newUser)
                .then((response) => {
                    setData(response);
                })
                .catch((signinError: Error) => {
                    setError([
                        {
                            detail: 'There was an issue signing in',
                            title: signinError.message,
                        },
                    ]);
                });
        },
        [setData, setError]
    );

    const logout = useCallback(() => {
        return auth.signout(() => {
            setData(null);
        });
    }, [setData]);

    const value = useMemo(
        () => ({ login, logout, user }),
        [login, logout, user]
    );

    if (isLoading || isIdle) {
        return <FullPageSpinner />;
    } else if (isError) {
        return <FullPageError errors={error} />;
    } else if (isSuccess) {
        return <AuthContext.Provider value={value} {...props} />;
    }

    throw new Error(`Unhandled status: ${status}`);
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context) {
        return context;
    } else {
        throw new Error(`useAuth must be used within a AuthProvider`);
    }
};
