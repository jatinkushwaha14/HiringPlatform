// API service for HTTP requests (simulated with MSW)
const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  status?: number;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Jobs API
export const jobsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/jobs');
  },

  async create(job: any): Promise<ApiResponse<any>> {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  },

  async update(id: string, job: any): Promise<ApiResponse<any>> {
    return apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Candidates API
export const candidatesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/candidates');
  },

  async updateStage(id: string, stage: string): Promise<ApiResponse<any>> {
    return apiRequest(`/candidates/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage }),
    });
  },
};

// Assessments API
export const assessmentsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/assessments');
  },

  async create(assessment: any): Promise<ApiResponse<any>> {
    return apiRequest('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment),
    });
  },

  async update(id: string, assessment: any): Promise<ApiResponse<any>> {
    return apiRequest(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assessment),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest(`/assessments/${id}`, {
      method: 'DELETE',
    });
  },

  async submitResponse(assessmentId: string, response: any): Promise<ApiResponse<any>> {
    return apiRequest(`/assessments/${assessmentId}/responses`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  },
};
