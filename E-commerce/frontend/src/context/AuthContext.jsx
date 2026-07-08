import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/auth.api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      if (userData.email) {
        setUser(userData)
      }

      const currentUser = await authAPI.getCurrentUser()
      if (currentUser?.email) {
        localStorage.setItem('userData', JSON.stringify(currentUser))
        setUser(currentUser)
      }
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('userData', JSON.stringify(response.user))
      setUser(response.user)
      toast.success(`Bienvenue, ${response.user.firstName} !`)
      return true
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion'
      toast.error(message)
      return false
    }
  }

  const register = async (userData) => {
    try {
      const { password, confirmPassword, acceptTerms, ...data } = userData
      await authAPI.register({ ...data, password })
      toast.success('Compte créé avec succès ! Connectez-vous.')
      return true
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription'
      toast.error(message)
      return false
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userData')
    setUser(null)
    toast.success('Déconnexion réussie')
  }

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser }
    localStorage.setItem('userData', JSON.stringify(merged))
    setUser(merged)
  }

  const value = {
    user,
    setUser: updateUser,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
