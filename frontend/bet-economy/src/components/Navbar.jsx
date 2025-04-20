import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  Home,
  Trophy,
  Store,
  Dice5,
  BookOpen,
  Users,
  ListTodo,
  BadgeCheck,
  Shield,
  LogIn,
  LayoutDashboard
} from 'lucide-react'
import elephant from '../assets/elephant.png'
import PropTypes from 'prop-types'

const Navbar = ({ isAdmin }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = user !== null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'bets', label: 'Bets', to: '/bets', icon: <Dice5 size={18} /> },
    { id: 'store', label: 'Store', to: '/store', icon: <Store size={18} /> },
    { id: 'tasks', label: 'Tasks', to: '/tasks', icon: <ListTodo size={18} /> },
    { id: 'achievements', label: 'Achievements', to: '/achievements', icon: <BadgeCheck size={18} /> },
    { id: 'leaderboard', label: 'Leaderboard', to: '/leaderboard', icon: <Trophy size={18} /> },
    { id: 'rules', label: 'Rules', to: '/rules', icon: <BookOpen size={18} /> },
    { id: 'profile', label: 'Profile', to: '/profile', icon: <Users size={18} /> },
    !isLoggedIn && { id: 'login', label: 'Login', to: '/login', icon: <LogIn size={18} /> },
  ].filter(Boolean);

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin',
      to: '/admin',
      icon: <Shield size={18} />
    })
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-black/30 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="flex items-center gap-2 hover:text-pink-400 transition">
        <img src={elephant} alt="Elephant" className="h-8 w-8" />
        <span className="font-bold text-lg">RPS</span>
      </Link>
      <div className="flex gap-6 ml-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1 rounded-full text-sm transition hover:bg-white/10 ${
                isActive ? 'bg-white/10 font-semibold' : 'text-white/80'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
Navbar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
}

export default Navbar
