import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { auth } from './auth';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.request.use(
    (config) => {
        const authDetails = auth.getAuthDetails();

        if (authDetails) {
            config.auth = {
                password: authDetails.session.token,
                username: authDetails.session.account_id,
            };
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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
            resolve(response);
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
