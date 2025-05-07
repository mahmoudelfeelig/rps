import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(!!token)

  const login = data => {
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setLoading(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      try{
        const res  = await fetch(`${API_BASE}/api/user/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to refresh user')
        setUser(data)
      } catch (err) {
        console.error('refreshUser error:', err)
        toast.error(err.message)
      }
    }
    finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      refreshUser()
    }
    else{
      setUser(null)
      setLoading(false)
    }
  }, [token, refreshUser])

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
