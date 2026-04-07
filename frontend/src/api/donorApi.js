import axiosClient from './axiosClient';

export const donorApi = {
  createRequest: (payload) => axiosClient.post('/donor/create', payload),
  getMyRequests: () => axiosClient.get('/donor/my-requests'),
  getHospitals: () => axiosClient.get('/donor/hospitals'),
  getMyInventory: () => axiosClient.get('/donor/inventory'),
  addInventory: (payload) => axiosClient.patch('/donor/inventory/add', payload),
};
