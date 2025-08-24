const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://audiotextly-production.up.railway.app/api' : 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  // Get auth headers for API requests
  getAuthHeaders(token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // Get all transcriptions
  async getTranscriptions(token) {
    const response = await fetch(`${this.baseUrl}/transcriptions`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch transcriptions`)
    }

    return response.json()
  }

  // Get a specific transcription
  async getTranscription(id, token) {
    const response = await fetch(`${this.baseUrl}/transcriptions/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch transcription`)
    }

    return response.json()
  }

  // Create a new transcription
  async createTranscription(transcriptionData, token) {
    const response = await fetch(`${this.baseUrl}/transcriptions`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(transcriptionData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to create transcription`)
    }

    return response.json()
  }

  // Delete a transcription
  async deleteTranscription(id, token) {
    const response = await fetch(`${this.baseUrl}/transcriptions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to delete transcription`)
    }

    return response.json()
  }

  // Update a transcription
  async updateTranscription(id, updateData, token) {
    const response = await fetch(`${this.baseUrl}/transcriptions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to update transcription`)
    }

    return response.json()
  }
}

export default new ApiService()
