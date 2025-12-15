import axios from 'axios'
import appConfig from '../config/appConfig'

const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
})

function readAuthFrom(storage) {
  try {
    const raw = storage.getItem('iafm_auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token ? parsed : null
  } catch {
    return null
  }
}

// Migration “one shot”: localStorage -> sessionStorage (si session vide)
function ensureSessionAuth() {
  if (typeof window === 'undefined') return null

  const sessionAuth = readAuthFrom(window.sessionStorage)
  if (sessionAuth?.token) return sessionAuth

  const legacyAuth = readAuthFrom(window.localStorage)
  if (legacyAuth?.token) {
    // On copie vers session pour ce tab
    window.sessionStorage.setItem('iafm_auth', JSON.stringify(legacyAuth))
    return legacyAuth
  }

  return null
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const auth = ensureSessionAuth()

    if (auth?.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${auth.token}`
    }
  }
  return config
})

export default api
