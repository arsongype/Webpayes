import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../api/auth.api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const updatedUser = await authAPI.updateProfile(data)
      setUser(updatedUser || data)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              placeholder="Votre prénom"
              {...register('firstName', { required: 'Le prénom est requis' })}
              error={errors.firstName?.message}
            />
            <Input
              label="Nom"
              placeholder="Votre nom"
              {...register('lastName', { required: 'Le nom est requis' })}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email"
            type="email"
            disabled
            {...register('email')}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={isLoading}>
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Informations du compte</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Rôle</span>
            <span className="font-medium">{user.role || 'Utilisateur'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Membre depuis</span>
            <span className="font-medium">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}