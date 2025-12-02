import axios from 'axios'
import appConfig from '../config/appConfig'

const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('iafm_auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return config
})

export default api
