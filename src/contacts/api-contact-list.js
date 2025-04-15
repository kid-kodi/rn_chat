import queryString from 'query-string';
import axiosInstance from '../core/networks/AxiosInstance';

export const list = params => {
  const query = queryString.stringify(params);
  return axiosInstance
    .get('/api/users?' + query)
    .then(response => {
      return response;
    })
    .catch(err => console.log(err));
};

export const search = params => {
  const query = queryString.stringify(params);
  return axiosInstance.get('/api/users/search?' + query)
    .then(response => {
      return response;
    })
    .catch(err => console.log(err));
};
