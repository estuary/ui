import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { auth } from './auth';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

export const setAuthHeader = (
    token: string | null,
    account_id?: string | null
) => {
    if (token && account_id) {
        axios.defaults.auth = {
            password: token,
            username: account_id,
        };

        // TODO add this in when we have more auth optiosn
        // axios.defaults.headers.common.Authorization = `Bearer `;
    } else {
        delete axios.defaults.auth;
    }
};

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            await auth.signout();
        }

        return Promise.reject(error);
    }
);

export const withAxios = (
    fn: AxiosPromise,
    setError: Function,
    setLoading: Function
) => {
    return new Promise<AxiosResponse<any, any>>((resolve: any, reject: any) => {
        fn.then((response) => {
            if (response.data.redirect) {
                void auth.signout();
            } else {
                resolve(response);
            }
        })
            .catch((error) => {
                const errorMessage = error.response
                    ? error.response.data.message
                    : error.message;
                setError(errorMessage);
                reject(error);
            })
            .finally(() => {
                setLoading(false);
            });
    });
};

export default axios;
