const API_BASE_URL = 'http://localhost:5000/api'

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken')
    this.user = JSON.parse(localStorage.getItem('user'))
  }

  // Set auth token and user data
  setAuth(token, user) {
    this.token = token
    this.user = user
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  // Clear auth data
  clearAuth() {
    this.token = null
    this.user = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store token and user data
      this.setAuth(data.token, data.user)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile')
      }

      // Update stored user data
      this.user = data.user
      localStorage.setItem('user', JSON.stringify(data.user))

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Logout user
  async logout() {
    try {
      // Clear local auth data
      this.clearAuth()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user
  }

  // Get current user
  getCurrentUser() {
    return this.user
  }

  // Get auth token
  getToken() {
    return this.token
  }
}

export default new AuthService()
