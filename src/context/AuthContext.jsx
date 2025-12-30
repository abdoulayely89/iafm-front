// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  // loading = bootstrap (lecture storage)
  const [loading, setLoading] = useState(true)

  // actionLoading = actions login/register
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('iafm_auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token)
          setUser(parsed.user)

          // ✅ utile : set header global
          api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`
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

    window.localStorage.setItem(
      'iafm_auth',
      JSON.stringify({ token: newToken, user: newUser })
    )

    // ✅ utile : set header global
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`
  }

  const clearAuth = () => {
    setToken(null)
    setUser(null)
    window.localStorage.removeItem('iafm_auth')
    window.sessionStorage.removeItem('iafm_auth')
    delete api.defaults.headers.common.Authorization
  }

  const login = async (credentials) => {
    setActionLoading(true)
    try {
      const { data } = await api.post('/auth/login', credentials)
      if (data?.token && data?.user) {
        saveAuth(data.token, data.user)
      }
      return data
    } catch (err) {
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const register = async (payload) => {
    setActionLoading(true)
    try {
      const { data } = await api.post('/auth/register', payload)

      // ✅ si ton backend renvoie token+user
      if (data?.token && data?.user) {
        saveAuth(data.token, data.user)
      }

      // ✅ IMPORTANT: toujours retourner data
      return data
    } catch (err) {
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      actionLoading,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout: clearAuth,
    }),
    [user, token, loading, actionLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
