import Spinner from '../ui/Spinner'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-2xl font-bold mb-6 shadow-lg">
          S
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Shop<span className="text-primary-600">Ease</span>
        </h2>
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500">Chargement en cours...</p>
      </div>
    </div>
  )
}
