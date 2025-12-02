import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = window.localStorage.getItem('iafm_auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token)
          setUser(parsed.user)
        }
      } catch (e) {
        console.error('Erreur parse auth storage', e)
      }
    }
    setLoading(false)
  }, [])

  const saveAuth = (newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    window.localStorage.setItem('iafm_auth', JSON.stringify({ token: newToken, user: newUser }))
  }

  const clearAuth = () => {
    setToken(null)
    setUser(null)
    window.localStorage.removeItem('iafm_auth')
  }

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    if (data?.token && data?.user) {
      saveAuth(data.token, data.user)
    }
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    if (data?.token && data?.user) {
      saveAuth(data.token, data.user)
    }
    return data
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout: clearAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
