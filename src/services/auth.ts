import { AxiosResponse } from 'axios';
import { AccountResponse, AuthLocalResponse } from '../types';
import axios, { setAuthHeader } from './axios';

export const authDetailsKey = '__auth_details__';

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
    async getAccountID() {
        const details = window.localStorage.getItem(authDetailsKey);

        if (details) {
            return JSON.parse(details).account_id;
        } else {
            return null;
        }
    },
    async getToken() {
        const details = window.localStorage.getItem(authDetailsKey);

        if (details) {
            return JSON.parse(details).token;
        } else {
            return null;
        }
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
                .then((response: AxiosResponse<AuthLocalResponse>) => {
                    const { account_id, token } = response.data.data.attributes;

                    window.localStorage.setItem(
                        authDetailsKey,
                        JSON.stringify(response.data.data.attributes)
                    );
                    setAuthHeader(token, account_id);
                    auth.getAccountDetails(response.data.data.links.account)
                        .then((accountDetails) => {
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
        window.localStorage.removeItem(authDetailsKey);
        setAuthHeader(null);
        callback?.();
    },
};
