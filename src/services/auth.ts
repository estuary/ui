import { accountEndpoint, AccountResponse } from 'endpoints/account';
import { sessionEndpoints, type SessionLocalResponse } from 'endpoints/session';

export interface AuthDetails {
    session: SessionLocalResponse['data']['attributes'];
    user?: AccountResponse['data']['attributes'];
}

export const sessionStorageKey = '__auth_session__';
export const userStorageKey = '__auth_user__';

export const auth = {
    getAccountDetails(path: string) {
        return new Promise<AccountResponse['data']['attributes']>(
            (resolve, reject) => {
                return accountEndpoint
                    .read(path)
                    .then((response) => {
                        resolve(response.data.attributes);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        );
    },
    getAuthDetails() {
        const session = window.localStorage.getItem(sessionStorageKey);
        let response: AuthDetails | null = null;

        if (session) {
            const user = window.localStorage.getItem(userStorageKey);

            response = { session: JSON.parse(session) };

            if (user) {
                response.user = JSON.parse(user);
            }
        }

        return response;
    },
    getAuthHeader() {
        const authDetails = auth.getAuthDetails();
        let response;

        if (authDetails?.session) {
            const token = window.btoa(
                `${authDetails.session.account_id}:${authDetails.session.token}`
            );

            response = `Basic ${token}`;
        }

        return response;
    },
    removeAuthDetails() {
        window.localStorage.removeItem(sessionStorageKey);
        window.localStorage.removeItem(userStorageKey);
    },
    saveSession(session: AuthDetails['session']) {
        window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    },
    saveUser(user: AuthDetails['user']) {
        window.localStorage.setItem(userStorageKey, JSON.stringify(user));
    },
    signin(username: string) {
        return new Promise<
            AccountResponse['data']['attributes']['display_name']
        >((resolve, reject) => {
            return sessionEndpoints
                .create(username)
                .then((sessionResponse) => {
                    auth.saveSession(sessionResponse.data.attributes);
                    auth.getAccountDetails(sessionResponse.links.account)
                        .then((accountDetails) => {
                            auth.saveUser(accountDetails);
                            resolve(accountDetails.display_name);
                        })
                        .catch((accountError) => {
                            reject(accountError);
                        });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
    async signout(callback?: VoidFunction) {
        auth.removeAuthDetails();
        callback?.();
    },
};
