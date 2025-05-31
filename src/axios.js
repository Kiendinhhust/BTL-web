import axios from 'axios';
//import lodash from 'lodash';
//import config from './config';

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    withCredentials: true
});

// const createError = (httpStatusCode, statusCode, errorMessage, problems, errorCode = '') => {
//     const error = new Error();
//     error.httpStatusCode = httpStatusCode;
//     error.statusCode = statusCode;
//     error.errorMessage = errorMessage;
//     error.problems = problems;
//     error.errorCode = errorCode + "";
//     return error;
// };

// export const isSuccessStatusCode = (s) => {
//     // May be string or number
//     const statusType = typeof s;
//     return (statusType === 'number' && s === 0) || (statusType === 'string' && s.toUpperCase() === 'OK');
// };

// instance.interceptors.response.use(
//     (response) => {
//         // Thrown error for request with OK status code
//         const { data } = response;
//         if (data.hasOwnProperty('s') && !isSuccessStatusCode(data['s']) && data.hasOwnProperty('errmsg')) {
//             return Promise.reject(createError(response.status, data['s'], data['errmsg'], null, data['errcode'] ? data['errcode'] : ""));
//         }

//         // Return direct data to callback
//         if (data.hasOwnProperty('s') && data.hasOwnProperty('d')) {
//             return data['d'];
//         }
//         // Handle special case
//         if (data.hasOwnProperty('s') && _.keys(data).length === 1) {
//             return null;
//         }
//         return response.data;
//     },
//     (error) => {
//         const { response } = error;
//         if (response == null) {
//             return Promise.reject(error);
//         }

//         const { data } = response;

//         if (data.hasOwnProperty('s') && data.hasOwnProperty('errmsg')) {
//             return Promise.reject(createError(response.status, data['s'], data['errmsg']));
//         }

//         if (data.hasOwnProperty('code') && data.hasOwnProperty('message')) {
//             return Promise.reject(createError(response.status, data['code'], data['message'], data['problems']));
//         }

//         return Promise.reject(createError(response.status));
//     }
// );

// Flag để tránh gọi đồng thời nhiều request refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.request.use(
  (config) => {
    // Thêm access token vào header nếu có
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh token, chờ queue xử lý
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Gọi API refresh token
      return new Promise(function (resolve, reject) {
        axios
          .post( `${process.env.REACT_APP_BACKEND_URL}/auth/refresh-access-token`, {}, { withCredentials: true })
          .then(({ data }) => {
            localStorage.setItem('accessToken', data.accessToken);
            instance.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
            processQueue(null, data.accessToken);
            resolve(instance(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default instance;