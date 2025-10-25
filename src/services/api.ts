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
  token: string;
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
  status: 'scheduled' | 'confirmed' | 'attended' | 'not-attended' | 'checked-in' | 'completed' | 'cancelled';
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

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  experience: number;
  qualification: string;
  consultationFee: number;
  rating: number;
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

  private   async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
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

  async rescheduleAppointment(id: string, date: string, time: string): Promise<{ success: boolean; message: string; data: Appointment }> {
    return httpClient.patch(`/appointments/${id}`, { date, time });
  },

  async cancelAppointment(id: string): Promise<{ success: boolean; message: string; data: Appointment }> {
    return httpClient.patch(`/appointments/${id}`, { status: 'cancelled' });
  },

  async confirmAppointment(id: string): Promise<{ success: boolean; message: string; data: Appointment }> {
    return httpClient.patch(`/appointments/${id}/confirm`);
  },

  async markAttendance(id: string, attended: boolean): Promise<{ success: boolean; message: string; data: Appointment }> {
    return httpClient.patch(`/appointments/${id}/attendance`, { attended });
  },
};

// Public API for booking (no authentication required)
export const publicBookingApi = {
  async createAppointment(appointmentData: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    reason?: string;
    phone?: string;
    email?: string;
  }): Promise<{ success: boolean; message: string; data: Appointment }> {
    return httpClient.post('/public/appointments', appointmentData);
  }
};

// Public API for doctors (no authentication required)
export const publicDoctorsApi = {
  async getDoctors(): Promise<{ success: boolean; data: Doctor[] }> {
    return httpClient.get('/public/doctors');
  }
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

export const doctorsApi = {
  async getDoctors(): Promise<{ success: boolean; data: Doctor[] }> {
    return httpClient.get('/doctors');
  },
};

export const adminApi = {
  async createDoctor(doctorData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    qualification?: string;
    specialization?: string[];
    experience?: number;
    licenseNumber?: string;
    consultationFee?: number;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return httpClient.post('/admin/doctors', doctorData);
  },

  async createReceptionist(receptionistData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return httpClient.post('/admin/receptionists', receptionistData);
  },

  async getUsers(): Promise<{ success: boolean; data: any[] }> {
    return httpClient.get('/admin/users');
  },
};

export const analyticsApi = {
  async getDashboardAnalytics(): Promise<{ success: boolean; data: Analytics }> {
    return httpClient.get('/analytics/dashboard');
  },
};

export const filesApi = {
  async uploadPrescriptionImage(file: File, prescriptionId: string): Promise<{ success: boolean; data: any }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('prescriptionId', prescriptionId);
    
    const response = await fetch(`${API_BASE_URL}/files/upload/prescription-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'UPLOAD_ERROR', 'Image upload failed');
    }

    return response.json();
  },

  async uploadPrescriptionPDF(file: File, prescriptionId: string): Promise<{ success: boolean; data: any }> {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('prescriptionId', prescriptionId);
    
    const response = await fetch(`${API_BASE_URL}/files/upload/prescription-pdf`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'UPLOAD_ERROR', 'PDF upload failed');
    }

    return response.json();
  },

  async getPrescriptionFiles(prescriptionId: string): Promise<{ success: boolean; data: any }> {
    const response = await fetch(`${API_BASE_URL}/files/prescription/${prescriptionId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'GET_ERROR', 'Failed to get prescription files');
    }

    return response.json();
  },

  async deletePrescriptionFiles(prescriptionId: string): Promise<{ success: boolean; data: any }> {
    const response = await fetch(`${API_BASE_URL}/files/prescription/${prescriptionId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'DELETE_ERROR', 'Failed to delete prescription files');
    }

    return response.json();
  },

  getFileUrl(filename: string, subfolder: string = ''): string {
    return `${API_BASE_URL}/uploads/prescriptions/${subfolder}/${filename}`;
  },

  getOrganizedFileUrl(relativePath: string): string {
    return `${API_BASE_URL}/uploads/prescriptions/${relativePath}`;
  },

  async generatePrescriptionPDF(prescriptionData: any): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/prescriptions/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescriptionData),
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'PDF_ERROR', 'Failed to generate PDF');
    }

    return response.blob();
  },

  async generateAndSavePrescriptionPDF(prescriptionData: any): Promise<{ success: boolean; data: any }> {
    const response = await fetch(`${API_BASE_URL}/prescriptions/generate-and-save-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescriptionData),
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'PDF_ERROR', 'Failed to generate and save PDF');
    }

    return response.json();
  },

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
