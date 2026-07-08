export const formatPrice = (price, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(price)
}

export const formatDate = (date, options = {}) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatPhoneNumber = (phone) => {
  return phone.replace(/(\d{2})(?=\d)/g, '$1 ')
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}