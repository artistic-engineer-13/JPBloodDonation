import axiosClient from './axiosClient';

export const hospitalApi = {
  getDashboard: () => axiosClient.get('/hospital/dashboard'),
  getInventory: () => axiosClient.get('/hospital/inventory'),
  getRequests: () => axiosClient.get('/hospital/requests'),
};
