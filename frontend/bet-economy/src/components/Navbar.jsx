import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Home, Trophy, Store, Dice5, BookOpen, Users, ListTodo } from 'lucide-react'
import elephant from '../assets/elephant.png';

const Navbar = () => {
  const navItems = [
    { label: 'Home', to: '/', icon: <Home size={18} /> },
    { label: 'Leaderboard', to: '/leaderboard', icon: <Trophy size={18} /> },
    { label: 'Bets', to: '/bets', icon: <Dice5 size={18} /> },
    { label: 'Rules', to: '/rules', icon: <BookOpen size={18} /> },
    { label: 'Tasks', to: '/tasks', icon: <ListTodo size={18} /> },
    { label: 'Store', to: '/store', icon: <Store size={18} /> },
    { label: 'Profile', to: '/profile', icon: <Users size={18} /> },
  ];
  

  return (
    <nav className="fixed top-0 z-50 w-full bg-black/30 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between shadow-md">
      {/* Elephant icon on left */}
      <Link to="/" className="flex items-center gap-2 hover:text-pink-400 transition">
        <img src={elephant} alt="Elephant" className="h-8 w-8" />
        <span className="font-bold text-lg">BetEconomy</span>
      </Link>
      {/* Nav items centered to the right */}
      <div className="flex gap-6 ml-auto">
        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
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

export default Navbar
