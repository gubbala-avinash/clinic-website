// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'receptionist' | 'doctor' | 'pharmacist' | 'patient';
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
  reason: string;
  phone: string;
  email: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: 'draft' | 'submitted' | 'sent-to-pharmacy' | 'fulfilled';
  medications: string[];
  diagnosis: string;
}

export interface Analytics {
  totalPatients: number;
  totalAppointments: number;
  totalPrescriptions: number;
  revenue: number;
  charts: {
    appointmentsByDay: Array<{ day: string; count: number }>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  };
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP Client
class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.code || 'UNKNOWN_ERROR',
          errorData.error || 'An error occurred'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'NETWORK_ERROR', 'Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create HTTP client instance
const httpClient = new HttpClient(API_BASE_URL);

// API Services
export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/register', userData);
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return httpClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    return httpClient.get('/auth/me');
  },
};

export const appointmentsApi = {
  async getAppointments(): Promise<{ success: boolean; data: Appointment[] }> {
    return httpClient.get('/appointments');
  },

  async createAppointment(appointment: Partial<Appointment>): Promise<{ success: boolean; data: Appointment }> {
    return httpClient.post('/appointments', appointment);
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<{ success: boolean; data: Appointment }> {
    return httpClient.patch(`/appointments/${id}`, updates);
  },
};

export const prescriptionsApi = {
  async getPrescriptions(): Promise<{ success: boolean; data: Prescription[] }> {
    return httpClient.get('/prescriptions');
  },

  async createPrescription(prescription: Partial<Prescription>): Promise<{ success: boolean; data: Prescription }> {
    return httpClient.post('/prescriptions', prescription);
  },

  async updatePrescription(id: string, updates: Partial<Prescription>): Promise<{ success: boolean; data: Prescription }> {
    return httpClient.patch(`/prescriptions/${id}`, updates);
  },
};

export const pharmacyApi = {
  async getPharmacyQueue(): Promise<{ success: boolean; data: any[] }> {
    return httpClient.get('/pharmacy');
  },

  async fulfillPrescription(id: string, data: { status: string; notes?: string }): Promise<{ success: boolean; data: any }> {
    return httpClient.patch(`/pharmacy/${id}/fulfill`, data);
  },
};

export const analyticsApi = {
  async getDashboardAnalytics(): Promise<{ success: boolean; data: Analytics }> {
    return httpClient.get('/analytics/dashboard');
  },
};

export const filesApi = {
  async uploadFile(file: File): Promise<{ success: boolean; data: any }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'UPLOAD_ERROR', 'File upload failed');
    }

    return response.json();
  },

  async uploadMultipleFiles(files: File[]): Promise<{ success: boolean; data: any[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`${API_BASE_URL}/files/upload-multiple`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'UPLOAD_ERROR', 'File upload failed');
    }

    return response.json();
  },

  async getFileInfo(id: string): Promise<{ success: boolean; data: any }> {
    return httpClient.get(`/files/${id}`);
  },

  async downloadFile(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/files/download/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'DOWNLOAD_ERROR', 'File download failed');
    }

    return response.blob();
  },

  async deleteFile(id: string): Promise<{ success: boolean; message: string }> {
    return httpClient.delete(`/files/${id}`);
  },
};

// Export the HTTP client for custom requests
export { httpClient };
