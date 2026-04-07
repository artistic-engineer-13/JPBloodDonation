import axiosClient from './axiosClient';

export const notificationApi = {
  getNotifications: (params) => axiosClient.get('/notifications', { params }),
  markAsRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
};
