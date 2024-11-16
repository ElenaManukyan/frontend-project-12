import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import i18next from 'i18next';

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/v1/login', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || i18next.t('errors.authErr'));
  }
});

export const signup = createAsyncThunk('auth/signup', async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/v1/signup', { username, password });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || i18next.t('errors.signupErr'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    username: localStorage.getItem('username') || null,
    token: localStorage.getItem('token') || null,
    isAuthorized: !!localStorage.getItem('token'),
    status: 'idle',
    error: null,
  },
  reducers: {
    setAuthorized(state, action) {
      return {
        ...state,
        isAuthorized: action.payload,
      };
    },
    clearAuthError(state) {
      return {
        ...state,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        return {
          ...state,
          status: 'loading',
          error: null,
        };
      })
      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('username', action.payload.username);
        return {
          ...state,
          status: 'succeeded',
          token: action.payload.token,
          username: action.payload.username,
          isAuthorized: true,
        };
      })
      .addCase(login.rejected, (state, action) => {
        return {
          ...state,
          status: 'failed',
          error: action.payload,
        };
      })
      .addCase(signup.pending, (state) => {
        return {
          ...state,
          status: 'loading',
          error: null,
        };
      })
      .addCase(signup.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('username', action.payload.username);
        return {
          ...state,
          status: 'succeeded',
          token: action.payload.token,
          username: action.payload.username,
          isAuthorized: true,
        };
      })
      .addCase(signup.rejected, (state, action) => {
        return {
          ...state,
          status: 'failed',
          error: action.payload,
        };
      });
  },
});

export const { setAuthorized, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
