import { authEndpoints, AuthTokenResponseReduced } from 'endpoints/auth';
import { isEmpty } from 'lodash';

export const tokenStorageKey = '__auth_token__';

export const auth = {
    getAuthHeader() {
        const token = auth.getToken();
        let response;

        if (isEmpty(token)) {
            const authHeader = window.btoa(`${token.accessToken}`);

            response = `Bearer ${authHeader}`;
        }

        return response;
    },
    fetchToken() {
        return new Promise<AuthTokenResponseReduced>((resolve, reject) => {
            return authEndpoints.session.tokens
                .read()
                .then((tokenResponse) => {
                    const tokenResponseReduced = {
                        accessToken: tokenResponse.accessToken,
                        ext: tokenResponse.credential.ext,
                        expires: tokenResponse.expires,
                        IDToken: tokenResponse.IDToken,
                    };
                    auth.saveToken(tokenResponseReduced);
                    resolve(tokenResponseReduced);
                })
                .catch(async (error) => {
                    await auth.signout();
                    reject(error);
                });
        });
    },
    getToken(): AuthTokenResponseReduced {
        const tokens = window.localStorage.getItem(tokenStorageKey);

        return JSON.parse(tokens ? tokens : '{}');
    },
    saveToken(tokens: AuthTokenResponseReduced) {
        window.localStorage.setItem(tokenStorageKey, JSON.stringify(tokens));
    },
    removeToken() {
        window.localStorage.removeItem(tokenStorageKey);
    },
    async signout(callback?: VoidFunction) {
        auth.removeToken();
        callback?.();
    },
};
