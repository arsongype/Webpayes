export const validateEmail = (email) => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return re.test(email)
}

export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[@$!%*?&]/.test(password)

  if (password.length < minLength) {
    return 'Le mot de passe doit contenir au moins 8 caractères'
  }
  if (!hasUpperCase) {
    return 'Le mot de passe doit contenir une majuscule'
  }
  if (!hasLowerCase) {
    return 'Le mot de passe doit contenir une minuscule'
  }
  if (!hasNumber) {
    return 'Le mot de passe doit contenir un chiffre'
  }
  if (!hasSpecialChar) {
    return 'Le mot de passe doit contenir un caractère spécial'
  }
  return null
}

export const validatePhone = (phone) => {
  const re = /^(\+33|0)[1-9](\d{2}){4}$/
  return re.test(phone.replace(/\s/g, ''))
}

export const validatePostalCode = (postalCode) => {
  const re = /^\d{5}$/
  return re.test(postalCode)
}

export const validateCardNumber = (cardNumber) => {
  const re = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/
  return re.test(cardNumber)
}

export const validateExpiryDate = (date) => {
  const re = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
  return re.test(date)
}

export const validateCVV = (cvv) => {
  const re = /^\d{3,4}$/
  return re.test(cvv)
}