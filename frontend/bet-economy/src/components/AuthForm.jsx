const AuthForm = ({ isLogin }) => {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-100 p-8 rounded-xl border border-dark-200">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        
        <form className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-gray-100"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-gray-100"
            />
          </div>

          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <a href={isLogin ? '/register' : '/login'} className="text-primary-500 hover:text-primary-400">
            {isLogin ? 'Create account' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  )
}

export default AuthForm