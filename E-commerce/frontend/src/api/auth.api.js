import axiosInstance from './axios.config'
import { authService } from '../services/authService'

async function withFallback(apiCall, fallback) {
  try {
    return await apiCall()
  } catch {
    return fallback()
  }
}

function getUserId() {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    return userData.id
  } catch {
    return null
  }
}

export const authAPI = {
  login: (credentials) =>
    withFallback(
      () => axiosInstance.post('/auth/login', credentials),
      () => {
        const user = authService.login(credentials)
        return { accessToken: 'local-' + user.id, refreshToken: null, user }
      }
    ),

  register: (userData) =>
    withFallback(
      () => axiosInstance.post('/auth/register', userData),
      () => authService.register(userData)
    ),

  logout: () =>
    withFallback(
      () => axiosInstance.post('/auth/logout'),
      () => ({ message: 'Déconnexion réussie' })
    ),

  refreshToken: (refreshToken) =>
    axiosInstance.post('/auth/refresh-token', { refreshToken }),

  forgotPassword: (email) =>
    axiosInstance.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    axiosInstance.post('/auth/reset-password', { token, newPassword }),

  getCurrentUser: () =>
    withFallback(
      () => axiosInstance.get('/auth/me'),
      () => JSON.parse(localStorage.getItem('userData') || 'null')
    ),

  updateProfile: (profileData) =>
    withFallback(
      () => axiosInstance.put('/auth/profile', profileData),
      () => authService.updateProfile(getUserId(), profileData)
    ),
}
