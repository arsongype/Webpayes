import { DEMO_USERS } from '../data/mockData'

const USERS_KEY = 'shopease_users'

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getAllUsers() {
  return [...DEMO_USERS, ...getRegisteredUsers()]
}

function sanitizeUser(user) {
  const { password, ...safe } = user
  return safe
}

export const authService = {
  login({ email, password }) {
    const user = getAllUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) throw new Error('Email ou mot de passe incorrect')
    return sanitizeUser(user)
  },

  register(userData) {
    const exists = getAllUsers().some(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    )
    if (exists) throw new Error('Cet email est déjà utilisé')

    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'USER',
      createdAt: new Date().toISOString(),
    }
    const registered = getRegisteredUsers()
    registered.push(newUser)
    saveRegisteredUsers(registered)
    return sanitizeUser(newUser)
  },

  updateProfile(userId, profileData) {
    const registered = getRegisteredUsers()
    const index = registered.findIndex((u) => u.id === userId)
    if (index >= 0) {
      registered[index] = { ...registered[index], ...profileData }
      saveRegisteredUsers(registered)
      return sanitizeUser(registered[index])
    }

    const demoUser = DEMO_USERS.find((u) => u.id === userId)
    if (demoUser) {
      return sanitizeUser({ ...demoUser, ...profileData })
    }

    throw new Error('Utilisateur non trouvé')
  },
}
