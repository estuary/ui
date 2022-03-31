import FullPageSpinner from 'components/fullPage/Spinner';
import { fromUnixTime } from 'date-fns';
import isFuture from 'date-fns/isFuture';
import { AuthTokenResponseReduced } from 'endpoints/auth';
import { useAsync } from 'hooks/useAsync';
import { isEmpty } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import FullPageError from '../components/fullPage/Error';
import { auth } from '../services/auth';

export interface AuthContextType {
    login: (username: string) => Promise<void>;
    logout: () => Promise<void>;
    user: AuthTokenResponseReduced | null;
}

export function isTokenExpired(expires: AuthTokenResponseReduced['expires']) {
    return isFuture(fromUnixTime(expires));
}

export function checkTokens(tokens: AuthTokenResponseReduced) {
    return isTokenExpired(tokens.expires) ? tokens : null;
}

export async function bootstrapUser() {
    const token = auth.getToken();

    return new Promise<AuthContextType['user']>((resolve) => {
        if (isEmpty(token)) {
            auth.fetchToken()
                .then((tokenResponse) => {
                    resolve(checkTokens(tokenResponse));
                })
                .catch(() => {
                    resolve(null);
                });
        } else if (isTokenExpired(token.expires)) {
            resolve(token);
        } else {
            resolve(null);
        }
    });
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
        setData,
        run,
        status,
    } = useAsync<AuthContextType['user']>();

    React.useEffect(() => {
        const appDataPromise = bootstrapUser();
        run(appDataPromise);
    }, [run]);

    const logout = useCallback(() => {
        return auth.signout(() => {
            setData(null);
        });
    }, [setData]);

    const value = useMemo(() => ({ logout, user }), [logout, user]);

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
