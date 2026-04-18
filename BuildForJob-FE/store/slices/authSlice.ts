import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/apis/auth.api';
import { User, LoginCredentials, RegisterData, VerifyOtpData } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const faceLogin = createAsyncThunk(
  'auth/faceLogin',
  async (data: { email: string; descriptor: number[] }, { rejectWithValue }) => {
    try {
      const response = await import('@/apis/axiosInstance').then(m =>
        m.default.post('/face/login', data)
      );
      const res = response.data;
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        return res.data;
      }
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Face login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      // Backend now returns token + user directly (OTP disabled)
      const response = await authApi.register(data) as any;

      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: VerifyOtpData, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(data);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (data: { email: string; type: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.resendOtp(data);
      if (response.success) {
        return response.message;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register (OTP disabled — direct token flow)
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Face Login
      .addCase(faceLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(faceLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(faceLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
