import axios from 'axios';

import { getCacheAccessToken, removeCacheToken } from './userService';

const CLIENT_TYPE_HEADER = 'X-Client-Type';

// Tương đương setupApi của package @itz/react-core trước đây
const setupApi = (config) => {
    const { getAccessToken, onUnauthorized, loginUrls = [] } = config;
    const axiosInstance = axios.create();

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const isLoginUrl = loginUrls?.some((url) => error.config?.url?.includes(url));
            if (error.response?.status === 401 && !isLoginUrl) {
                onUnauthorized?.();
            }
            return Promise.reject(error);
        },
    );

    const sendRequest = (options, payload, cancelToken) => {
        const { params = {}, pathParams = {}, data = {}, error = {}, mixinFuncs } = payload;
        const { method, baseURL, headers: configHeaders = {}, ignoreAuth, authorization } = options;
        const headers = { ...configHeaders };
        const accessToken = getAccessToken();

        if (!ignoreAuth && accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }
        if (authorization) {
            headers.Authorization = authorization;
        }
        headers[CLIENT_TYPE_HEADER] = 'WEB';
        if (params.token) {
            headers.Authorization = `Bearer ${params.token}`;
            delete params.token;
        }

        let url = baseURL;
        for (const key of Object.keys(pathParams)) {
            const keyCompare = `:${key}`;
            if (url.indexOf(keyCompare) !== -1) {
                url = url.replace(keyCompare, pathParams[key] || '');
            }
        }

        if (headers['Content-Type'] === 'multipart/form-data') {
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                formData.append(key, data[key]);
            });
            return axios
                .post(options.path, formData, {
                    headers: {
                        Authorization: headers.Authorization,
                        'Content-type': 'multipart/form-data',
                    },
                    ...mixinFuncs,
                })
                .then((res) => ({ data: res.data }))
                .catch((err) => {
                    console.log(err);
                    return { error: err };
                });
        }

        headers.Accept = 'application/json';
        return axiosInstance.request({
            method,
            url,
            headers,
            params,
            data,
            error,
            cancelToken,
            ...mixinFuncs,
        });
    };

    return { sendRequest, axiosInstance, config };
};

export const { axiosInstance, sendRequest, config } = setupApi({
    getAccessToken: () => getCacheAccessToken(),
    onUnauthorized: () => {
        // removeCacheToken();
        // window.location.href = '/login';
    },
});
