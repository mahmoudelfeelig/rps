const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-gray-300 mb-8">Page Not Found</p>
      <a 
        href="/"
        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Return Home
      </a>
    </div>
  )
}

export default NotFound