import axios, { AxiosResponse } from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.request.use(
    (config) => {
        // Do something before request is sent
        console.log('Request interceptor precall', config);
        config.headers = config.headers ? config.headers : {};
        //config.headers.Authorization = 'Basic ';
        return config;
    },
    (error) => {
        // Do something with request error
        console.log('Request interceptor error', error);
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response: AxiosResponse<any, any>) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        console.log('Response interceptor precall', response);
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        console.log('Response interceptor error', error);
        return Promise.reject(error);
    }
);

export const setAuthHeader = (token?: string) => {
    console.log('This is where we would set the header', token);
    // if (token) {
    //     axios.defaults.headers.common.Authorization = token;
    // } else {
    //     delete axios.defaults.headers.common.Authorization;
    // }
};

export default axios;
