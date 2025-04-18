import { Link, useNavigate } from 'react-router-dom'
import { GiElephant } from 'react-icons/gi'
import { FaHome, FaBook, FaUser, FaPlus, FaHeart } from 'react-icons/fa'

const Navbar = ({ isAdmin }) => {
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem('token')

  return (
    <nav className="bg-dark-100 p-4 border-b border-dark-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary-500">
          <GiElephant className="text-3xl" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-900 bg-clip-text text-transparent">
            BetEconomy
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 text-gray-300 hover:text-primary">
            <FaHome className="text-lg" />
            Home
          </Link>
          <Link to="/rules" className="flex items-center gap-1 text-gray-300 hover:text-primary">
            <FaBook className="text-lg" />
            Rules
          </Link>
          
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 text-gray-300 hover:text-primary">
              <FaPlus className="text-lg" />
              Admin
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <Link to="/profile" className="flex items-center gap-1 text-gray-300 hover:text-primary">
                <FaUser className="text-lg" />
                Profile
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('token')
                  navigate('/')
                }}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-gray-300 hover:text-primary">
                Login
              </Link>
              <Link to="/register" className="text-gray-300 hover:text-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar