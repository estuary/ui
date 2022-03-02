import { AxiosResponse } from 'axios';
import { AccountResponse, AuthLocalResponse } from '../types';
import axios, { setAuthHeader } from './axios';

const authTokenKey = '__auth_provider_token__';
const accountIDKey = '__auth_account_id__';

const auth = {
    getAccountDetails(path: string) {
        return new Promise<AxiosResponse<any, any>>(
            (resolve: any, reject: any) => {
                return axios
                    .get(path)
                    .then((response: AxiosResponse<AccountResponse>) => {
                        const { display_name } = response.data.data.attributes;
                        resolve(display_name);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        );
    },
    async getAccountID() {
        return window.localStorage.getItem(accountIDKey);
    },
    async getToken() {
        return window.localStorage.getItem(authTokenKey);
    },
    signin(username: string) {
        return new Promise<AxiosResponse<any, any>>(
            (resolve: any, reject: any) => {
                return axios
                    .post('/sessions/local', {
                        auth_token: username,
                    })
                    .then((response: AxiosResponse<AuthLocalResponse>) => {
                        const { account_id, token } =
                            response.data.data.attributes;

                        window.localStorage.setItem(authTokenKey, token);
                        window.localStorage.setItem(accountIDKey, account_id);
                        setAuthHeader(token, account_id);
                        auth.getAccountDetails(response.data.data.links.account)
                            .then((display_name) => {
                                resolve(display_name);
                            })
                            .catch((accountError) => {
                                reject(accountError);
                            });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        );
    },
    async signout(callback?: VoidFunction) {
        window.localStorage.removeItem(authTokenKey);
        window.localStorage.removeItem(accountIDKey);
        setAuthHeader(null);
        callback?.();
    },
};

export { auth, authTokenKey, accountIDKey };
