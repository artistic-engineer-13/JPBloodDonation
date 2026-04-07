import axiosClient from './axiosClient';

export const adminApi = {
  getDashboard: () => axiosClient.get('/admin/dashboard'),

  getUsers: (params) => axiosClient.get('/admin/users', { params }),
  updateUserStatus: (userId, payload) => axiosClient.patch(`/admin/users/${userId}/status`, payload),
  deleteUser: (userId) => axiosClient.delete(`/admin/users/${userId}`),

  getHospitals: (params) => axiosClient.get('/admin/hospitals', { params }),
  getHospitalActivity: (hospitalId) => axiosClient.get(`/admin/hospitals/${hospitalId}/activity`),

  getDonorRequests: (params) => axiosClient.get('/admin/donor-requests', { params }),
  getBloodRequests: (params) => axiosClient.get('/admin/blood-requests', { params }),

  approveDonorRequest: (id, payload = {}) => axiosClient.patch(`/admin/donor/${id}/approve`, payload),
  rejectDonorRequest: (id, payload) => axiosClient.patch(`/admin/donor/${id}/reject`, payload),

  approveBloodRequest: (id, payload = {}) => axiosClient.patch(`/admin/request/${id}/approve`, payload),
  rejectBloodRequest: (id, payload) => axiosClient.patch(`/admin/request/${id}/reject`, payload),

  getInventory: (params) => axiosClient.get('/admin/inventory', { params }),
  getDonorInventories: (params) => axiosClient.get('/admin/donor-inventories', { params }),
  getAuditLogs: (params) => axiosClient.get('/admin/audit-logs', { params }),
};
