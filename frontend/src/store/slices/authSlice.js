import { createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setLoading, setError, setUser, setToken, logout } = authSlice.actions;

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { user, token } = await authService.login(credentials);
    dispatch(setUser(user));
    dispatch(setToken(token));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Login failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { user, token } = await authService.register(userData);
    dispatch(setUser(user));
    dispatch(setToken(token));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Registration failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;