import { Link, useNavigate } from 'react-router-dom'
import { HiUserGroup, HiChartBar, HiCog, HiLogout } from 'react-icons/hi'

const Navbar = ({ user }) => {
  const navigate = useNavigate()

  return (
    <nav className="bg-dark-100 p-4 border-b-2 border-dark-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/elephant-icon.svg" className="h-8 w-8" alt="Logo" />
          <span className="text-xl font-bold text-primary">BetEconomy</span>
        </Link>

        <div className="flex gap-6 items-center">
          {user ? (
            <>
              <Link to="/groups" className="flex items-center gap-1">
                <HiUserGroup className="text-primary" />
                Groups
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-1">
                <HiChartBar className="text-primary" />
                Leaderboard
              </Link>
              <Link to="/settings" className="flex items-center gap-1">
                <HiCog className="text-primary" />
                Settings
              </Link>
              <button onClick={() => logout()} className="flex items-center gap-1">
                <HiLogout className="text-primary" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}