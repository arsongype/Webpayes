import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oups ! Quelque chose s'est mal passé
            </h1>
            <p className="text-gray-600 mb-8">
              Une erreur inattendue est survenue. Veuillez réessayer.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}