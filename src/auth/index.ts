import { AxiosResponse } from 'axios';
import axios, { setAuthHeader } from '../services/axios';
import { AccountResponse, AuthLocalResponse } from '../types';

const localStorageKey = '__auth_provider_token__';
const auth = {
    getAccountDetails(accountID: string) {
        return new Promise<AxiosResponse<any, any>>(
            (resolve: any, reject: any) => {
                return axios
                    .get(`accounts/${accountID}`)
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
    async getToken() {
        return window.localStorage.getItem(localStorageKey);
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
                        window.localStorage.setItem(localStorageKey, token);
                        setAuthHeader(token);
                        auth.getAccountDetails(account_id)
                            .then((accountResponse) => {
                                resolve(accountResponse);
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
        window.localStorage.removeItem(localStorageKey);
        setAuthHeader(null);
        callback?.();
    },
};

export { auth, localStorageKey };
