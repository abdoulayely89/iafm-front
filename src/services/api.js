// src/services/api.js
import axios from 'axios'
import appConfig from '../config/appConfig'

//un commentaire test
const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 20000, // ✅ évite les "pending" infinis (20s)
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
    window.sessionStorage.setItem('iafm_auth', JSON.stringify(legacyAuth))
    return legacyAuth
  }

  return null
}

api.interceptors.request.use((config) => {
  // Auth header (Bearer)
  if (typeof window !== 'undefined') {
    const auth = ensureSessionAuth()
    if (auth?.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${auth.token}`
    }
  }

  config.headers = config.headers || {}

  // ✅ IMPORTANT:
  // Ne pas forcer Content-Type = application/json si on envoie du FormData.
  // Axios doit gérer le multipart/form-data + boundary automatiquement.
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData

  if (!isFormData) {
    config.headers['Content-Type'] = 'application/json'
  } else {
    // Au cas où un Content-Type aurait été fixé ailleurs
    delete config.headers['Content-Type']
    delete config.headers['content-type']
  }

  return config
})

// Optionnel : log utile en dev
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Axios timeout
    if (err.code === 'ECONNABORTED') {
      err.message = 'La requête a expiré (timeout).'
    }
    throw err
  }
)

export default api
