import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Home, Trophy, Store, Dice5, BookOpen, Users, ListTodo, BadgeCheck,
  Shield, LogIn, LayoutDashboard, User, Gamepad, Menu, X
} from 'lucide-react';
import elephant from '../assets/elephant.png';
import SkipLink from './SkipLink';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);
  const firstLinkRef = useRef(null);
  const toggleRef = useRef(null);
  const location = useLocation();

  // Build items from auth state so it updates immediately after login/logout
  const navItems = useMemo(() => {
    const items = [
      { id: 'home', label: 'Home', to: '/', icon: <Home size={16} /> },
      { id: 'rules', label: 'Rules', to: '/rules', icon: <BookOpen size={16} /> }
    ];
    if (isLoggedIn) {
      items.push(
        { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={16} /> },
        { id: 'bets', label: 'Bets', to: '/bets', icon: <Dice5 size={16} /> },
        { id: 'store', label: 'Store', to: '/store', icon: <Store size={16} /> },
        { id: 'games', label: 'Games', to: '/games', icon: <Gamepad size={16} /> },
        { id: 'services', label: 'Services', to: '/services', icon: <Users size={16} /> },
        { id: 'tasks', label: 'Tasks', to: '/tasks', icon: <ListTodo size={16} /> },
        { id: 'achievements', label: 'Achievements', to: '/achievements', icon: <BadgeCheck size={16} /> },
        { id: 'leaderboard', label: 'Leaderboard', to: '/leaderboard', icon: <Trophy size={16} /> },
        { id: 'profile', label: 'My Profile', to: '/profile', icon: <User size={16} /> }
      );
      if (isAdmin) {
        items.push({ id: 'admin', label: 'Admin', to: '/admin', icon: <Shield size={16} /> });
      }
    } else {
      items.push({ id: 'login', label: 'Login', to: '/login', icon: <LogIn size={16} /> });
    }
    return items;
  }, [isLoggedIn, isAdmin]);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // ESC close + simple focus trap
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
      if (!open || !drawerRef.current || e.key !== 'Tab') return;
      const focusables = drawerRef.current.querySelectorAll('a,button');
      const list = Array.from(focusables);
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => { if (open) firstLinkRef.current?.focus(); }, [open]);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
      <SkipLink />
      <div className="container h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:text-pink-400 transition">
          <img src={elephant} alt="" className="w-6 h-6 rounded" />
          <span className="font-bold text-pink-400">RPS</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2" role="navigation" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                [
                  'px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition',
                  isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                ].join(' ')
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          className="md:hidden p-2 rounded-lg hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-drawer"
          ref={drawerRef}
          className="md:hidden border-t border-white/10 bg-[#0e0e0f]"
          role="dialog"
          aria-modal="true"
        >
          <div className="container px-4 py-2 flex flex-col">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.id}
                to={item.to}
                ref={idx === 0 ? firstLinkRef : undefined}
                className={({ isActive }) =>
                  [
                    'px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition',
                    isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                  ].join(' ')
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
