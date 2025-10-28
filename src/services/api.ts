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

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      // Try parse error body when possible
      if (contentType.includes('application/json')) {
        const errJson = await response.json();
        throw new Error(errJson?.message || `HTTP ${response.status}`);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    if (!contentType.includes('application/json')) {
      // This usually means MSW isn't intercepting and you got back index.html
      const text = await response.text();
      throw new Error('Expected JSON response. Is MSW worker running? First bytes: ' + text.slice(0, 80));
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
  async list(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    tags?: string[];
  } = {}): Promise<ApiResponse<{ items: any[]; total: number; page: number; pageSize: number }>> {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.sort) q.set('sort', params.sort);
    if (params.tags && params.tags.length) q.set('tags', params.tags.join(','));
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiRequest(`/jobs${query}`);
  },

  async create(job: any): Promise<ApiResponse<any>> {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  },

  async update(id: string, updates: any): Promise<ApiResponse<any>> {
    return apiRequest(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async reorder(id: string, payload: { fromOrder: number; toOrder: number }): Promise<ApiResponse<any>> {
    return apiRequest(`/jobs/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
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
