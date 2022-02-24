import axios, { AxiosPromise, AxiosResponse } from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

export const setAuthHeader = (token?: string) => {
    console.log('This is where we would set the header', token);
    // if (token) {
    //     axios.defaults.headers.common.Authorization = token;
    // } else {
    //     delete axios.defaults.headers.common.Authorization;
    // }
};

export const withAxios = (
    fn: AxiosPromise,
    setError: Function,
    setLoading: Function,
    auth: any
) => {
    return new Promise<AxiosResponse<any, any>>((resolve: any, reject: any) => {
        fn.then((response) => {
            if (response.data.redirect) {
                auth.signout();
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
