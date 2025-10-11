import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser]   = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })

  const login = data => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      const res  = await fetch(`${API_BASE}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to refresh user')
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
    } catch (err) {
      console.error('refreshUser error:', err)
      toast.error(err.message)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      refreshUser()
    }
  }, [token, refreshUser])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
