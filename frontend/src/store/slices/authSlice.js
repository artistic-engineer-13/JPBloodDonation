import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authApi } from '../../api/authApi';

const STORAGE_KEY = 'jp_blood_auth';

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const persistAuth = ({ user, token }) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
};

const removeAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const initializeAuth = createAsyncThunk('auth/initializeAuth', async () => {
  const stored = readStoredAuth();

  if (!stored?.token) {
    return { user: null, token: null };
  }

  try {
    const response = await authApi.me();
    const user = response?.data?.data?.user || null;

    if (!user) {
      removeAuth();
      return { user: null, token: null };
    }

    persistAuth({ user, token: stored.token });
    return { user, token: stored.token };
  } catch (error) {
    removeAuth();
    return { user: null, token: null };
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.login(payload);
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Registration failed');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(user && token);
      state.error = null;
      persistAuth({ user, token });
    },
    clearAuthState(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      removeAuth();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = Boolean(action.payload.user && action.payload.token);
        state.isCheckingAuth = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = Boolean(action.payload.user && action.payload.token);
        state.error = null;
        persistAuth({ user: action.payload.user, token: action.payload.token });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = Boolean(action.payload.user && action.payload.token);
        state.error = null;
        persistAuth({ user: action.payload.user, token: action.payload.token });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });
  },
});

export const { setAuthState, clearAuthState, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
