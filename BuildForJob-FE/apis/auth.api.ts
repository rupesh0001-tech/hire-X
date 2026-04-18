import api from './axiosInstance';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  VerifyOtpData, 
  ProfileResponse,
  ApiResponse
} from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/user/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/user/register', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/verify/otp', data);
    return response.data;
  },

  resendOtp: async (data: { email: string; type: string }): Promise<any> => {
    const response = await api.post('/verify/resend-otp', data);
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>('/user/profile');
    return response.data;
  },

  updateProfile: async (data: any): Promise<ProfileResponse> => {
    const response = await api.patch<ProfileResponse>('/user/profile', data);
    return response.data;
  },

  getUserProfile: async (id: string): Promise<{ success: boolean; data: any }> => {
    const response = await api.get(`/user/profile/${id}`);
    return response.data;
  },

  logout: async () => {
    return { success: true };
  }
};
