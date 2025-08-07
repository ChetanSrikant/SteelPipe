// api/client.js

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'https://407a-49-37-154-79.ngrok-free.app';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: 'include', // Include cookies if needed
    };

    try {
      const response = await fetch(url, config);
      
      // Handle HTTP errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', {
        url,
        error: error.message,
        stack: error.stack,
      });
      
      // Enhance error message for network issues
      if (error.message === 'Failed to fetch') {
        throw new Error(
          'Network request failed. Possible causes:\n' +
          '1. API server is down or unreachable\n' +
          '2. CORS policy blocking the request\n' +
          '3. Invalid SSL certificate\n' +
          `URL: ${url}`
        );
      }
      
      throw error;
    }
  }

  // Specific API methods with proper error handling
  async getPipeOptions() {
    return this.request('/generate_forecast_MPL', {
      method: 'GET',
    });
  }

  async getForecast(params) {
    return this.request('/forecast', {
      method: 'POST', // Changed to POST as 405 suggests GET wasn't allowed
      body: JSON.stringify(params),
    });
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;