import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  try {
    const authRaw = localStorage.getItem('jp_blood_auth');
    if (!authRaw) {
      return config;
    }

    const auth = JSON.parse(authRaw);
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  } catch (error) {
    // Ignore storage parsing errors and continue unauthenticated.
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('jp_blood_auth');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
