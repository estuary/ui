import FullPageSpinner from 'components/FullPageSpinner';
import { useAsync } from 'hooks/useAsync';
import React, { useCallback, useMemo } from 'react';
import { auth } from '../auth';

export interface AuthContextType {
    login: (username: string) => Promise<void>;
    logout: () => Promise<void>;
    user: any;
}

export async function bootstrapUser() {
    let user = null;

    const token = await auth.getToken();
    if (token) {
        const accountID = await auth.getAccountID();
        if (accountID) {
            user = await auth.getAccountDetails(accountID);
        }
    }
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
        status,
    } = useAsync();

    React.useEffect(() => {
        const appDataPromise = bootstrapUser();
        run(appDataPromise);
    }, [run]);

    const login = useCallback(
        (newUser: string) => {
            return auth
                .signin(newUser)
                .then((response: any) => {
                    console.log('signed in work', response);
                    setData(newUser);
                })
                .catch(() => {
                    console.log('signed in fail');
                });
        },
        [setData]
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
        return error;
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
