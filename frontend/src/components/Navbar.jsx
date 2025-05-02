import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  LayoutDashboard,
  LogOut,
  User
} from 'lucide-react';
import elephant from '../assets/elephant.png';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ isAdmin }) => {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const navItems = [
    { id: 'home', label: 'Home', to: '/', icon: <Home size={18} /> },
    { id: 'rules', label: 'Rules', to: '/rules', icon: <BookOpen size={18} /> },
  ];

  if (isLoggedIn) {
    navItems.push(
      { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'bets', label: 'Bets', to: '/bets', icon: <Dice5 size={18} /> },
      { id: 'store', label: 'Store', to: '/store', icon: <Store size={18} /> },
      { id: 'tasks', label: 'Tasks', to: '/tasks', icon: <ListTodo size={18} /> },
      { id: 'achievements', label: 'Achievements', to: '/achievements', icon: <BadgeCheck size={18} /> },
      { id: 'leaderboard', label: 'Leaderboard', to: '/leaderboard', icon: <Trophy size={18} /> },
      {
        id: 'profile',
        label: 'My Profile',
        to: '/profile',
        icon: <User size={18} />
      }
    );
    if (isAdmin) {
      navItems.push({
        id: 'admin',
        label: 'Admin',
        to: '/admin',
        icon: <Shield size={18} />
      });
    }
  } else {
    navItems.push(
      { id: 'login', label: 'Login', to: '/login', icon: <LogIn size={18} /> },
    );
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-black/30 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="flex items-center gap-2 hover:text-pink-400 transition">
        <img src={elephant} alt="Elephant" className="h-8 w-8" />
        <span className="font-bold text-lg">RPS</span>
      </Link>
      <div className="flex gap-6 ml-auto items-center">
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
  );
};

Navbar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
};

export default Navbar;
