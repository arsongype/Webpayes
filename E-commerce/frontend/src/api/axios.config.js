import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userData')
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
