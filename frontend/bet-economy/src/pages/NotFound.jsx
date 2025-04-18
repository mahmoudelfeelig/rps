import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center text-center text-white px-4">
      <div>
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl mb-6">Oops! Page not found.</p>
        <Link to="/" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
