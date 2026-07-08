import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
  })

  const onSubmit = async (data) => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const success = await login(data)
      if (success) {
        navigate('/')
      } else {
        setErrorMessage('Email ou mot de passe incorrect')
        setError('root', {
          type: 'manual',
          message: 'Email ou mot de passe incorrect'
        })
      }
    } catch (error) {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (type) => {
    if (type === 'user') {
      register('email').onChange({ target: { value: 'demo@shopease.fr' } })
      register('password').onChange({ target: { value: 'Demo123!' } })
    } else {
      register('email').onChange({ target: { value: 'admin@shopease.fr' } })
      register('password').onChange({ target: { value: 'Admin123!' } })
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <Link to="/">
            <motion.h2
              whileHover={{ scale: 1.05 }}
              className="text-4xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
            >
              Shop<span className="text-gray-900">Ease</span>
            </motion.h2>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Bienvenue !
          </h1>
          <p className="mt-2 text-gray-600">
            Connectez-vous pour accéder à votre compte
          </p>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-2" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-sm bg-white/95"
        >
          <Input
            label="Email"
            type="email"
            icon={FiMail}
            placeholder="votre@email.com"
            error={errors.email?.message}
            onFocus={() => clearErrors('root')}
            {...register('email', {
              required: 'L\'email est requis',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide',
              },
            })}
          />

          <div className="relative">
            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              icon={FiLock}
              placeholder="Votre mot de passe"
              error={errors.password?.message}
              onFocus={() => clearErrors('root')}
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Minimum 6 caractères',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={showPassword ? 'hide' : 'show'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>

          {/* Demo Credentials Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <FiShield className="w-3 h-3" />
              Comptes de démonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('user')}
                className="text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-left group"
              >
                <span className="font-medium text-gray-700 group-hover:text-primary-600">Utilisateur</span>
                <p className="text-gray-500 text-xs mt-1">demo@shopease.fr</p>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-left group"
              >
                <span className="font-medium text-gray-700 group-hover:text-primary-600">Administrateur</span>
                <p className="text-gray-500 text-xs mt-1">admin@shopease.fr</p>
              </button>
            </div>
          </motion.div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                {...register('rememberMe')}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                Se souvenir de moi
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            className="group"
          >
            <span className="flex items-center justify-center">
              Se connecter
              <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </Button>

          {/* Social Login */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </motion.button>
          </div>
        </motion.form>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage