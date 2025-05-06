import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { API_BASE } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Read token and user from localStorage initially
  const [token, setToken]   = useState(() => localStorage.getItem('token'));
  const [user, setUser]     = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  // loading = true while we hydrate/refresh the user
  const [loading, setLoading] = useState(true);

  // Login saves token and user to state + localStorage
  const login = data => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  // Logout clears everything
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Refresh user data (balance, stats, etc.) from API, merge into existing user
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res   = await fetch(`${API_BASE}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const stats = await res.json();
      if (!res.ok) throw new Error(stats.message || 'Failed to refresh user');
      // Merge server stats into our existing user object so we retain role, username, etc.
      const updatedUser = { ...user, ...stats };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error('refreshUser error:', err);
      toast.error(err.message);
    }
  }, [token, user]);

  // Hydrate on mount or when token changes
  useEffect(() => {
    let isCancelled = false;

    const hydrate = async () => {
      if (!token) {
        // no token = not logged in
        if (!isCancelled) setLoading(false);
        return;
      }
      // if we have a token, fetch latest user stats
      await refreshUser();
      if (!isCancelled) setLoading(false);
    };

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, [token, refreshUser]);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to access auth context
export const useAuth = () => useContext(AuthContext);