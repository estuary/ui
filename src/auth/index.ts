import { AxiosResponse } from 'axios';
import axios, { setAuthHeader } from '../services/axios';
import { AccountResponse, AuthLocalResponse } from '../types';

const authTokenKey = '__auth_provider_token__';
const accountIDKey = '__auth_account_id__';

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
                    .catch(async (error) => {
                        console.log('Failed3', error);
                        if (error.response.status === 401) {
                            await auth.signout();
                        }

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
                        setAuthHeader(token);
                        auth.getAccountDetails(account_id)
                            .then((display_name) => {
                                resolve(display_name);
                            })
                            .catch((accountError) => {
                                console.log('Failed2', accountError);
                                reject(accountError);
                            });
                    })
                    .catch((error) => {
                        console.log('Failed1', error);
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
