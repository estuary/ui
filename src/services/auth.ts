import { AxiosResponse } from 'axios';
import { AccountResponse, AuthLocalResponse } from '../types';
import axios from './axios';

export interface AuthDetails {
    session: AuthLocalResponse['data']['attributes'];
    user?: AccountResponse['data']['attributes'];
}

export const sessionStorageKey = '__auth_session__';
export const userStorageKey = '__auth_user__';

export const auth = {
    getAccountDetails(path: string) {
        return new Promise<AccountResponse['data']['attributes']>(
            (resolve: any, reject: any) => {
                return axios
                    .get(path)
                    .then((response: AxiosResponse<AccountResponse>) => {
                        resolve(response.data.data.attributes);
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
    removeAuthDetails() {
        window.localStorage.removeItem(sessionStorageKey);
    },
    saveSession(session: AuthDetails['session']) {
        window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    },
    saveUser(user: AuthDetails['user']) {
        window.localStorage.setItem(userStorageKey, JSON.stringify(user));
    },
    signin(username: string) {
        return new Promise<
            AxiosResponse<
                AccountResponse['data']['attributes']['display_name'],
                any
            >
        >((resolve: any, reject: any) => {
            return axios
                .post('/sessions/local', {
                    auth_token: username,
                })
                .then((sessionResponse: AxiosResponse<AuthLocalResponse>) => {
                    auth.saveSession(sessionResponse.data.data.attributes);

                    auth.getAccountDetails(
                        sessionResponse.data.data.links.account
                    )
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
