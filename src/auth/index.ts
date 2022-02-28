import { AxiosResponse } from 'axios';
import axios, { setAuthHeader } from '../services/axios';
import { AuthLocalResponse } from '../types';

const localStorageKey = '__auth_provider_token__';
const auth = {
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
                        const { token } = response.data.data.attributes;
                        window.localStorage.setItem(localStorageKey, token);
                        setAuthHeader(token);
                        resolve(response);
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
