import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      tokenRefreshTimer: null,

      // Initialize auth state on app load
      initializeAuth: () => {
        try {
          const { accessToken, refreshToken } = get();
          if (accessToken && refreshToken) {
            set({ isAuthenticated: true });
            get().startTokenRefreshTimer();
            get().fetchUserProfile();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          get().logout();
        }
      },

      // Login action
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', credentials);
          
          // Check if response is valid
          if (!response || !response.data) {
            throw new Error('Invalid response from server');
          }

          const { access_token, refresh_token } = response.data;
          
          if (!access_token || !refresh_token) {
            throw new Error('Invalid credentials received from server');
          }
          
          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set up token refresh timer
          get().startTokenRefreshTimer();
          
          // Fetch user profile
          await get().fetchUserProfile();
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            user: null
          });
          
          // Handle different types of errors
          let errorMessage = 'Login failed. Please try again.';
          
          if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const serverMessage = error.response.data?.detail || error.response.data?.message;
            
            switch (status) {
              case 401:
                errorMessage = 'Invalid email or password. Please check your credentials.';
                break;
              case 403:
                errorMessage = 'Account access denied. Please contact support.';
                break;
              case 404:
                errorMessage = 'Account not found. Please check your email or sign up.';
                break;
              case 429:
                errorMessage = 'Too many login attempts. Please try again later.';
                break;
              case 500:
                errorMessage = 'Server error. Please try again later.';
                break;
              default:
                errorMessage = serverMessage || `Login failed (${status}). Please try again.`;
            }
          } else if (error.request) {
            // Network error
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            // Other errors
            errorMessage = error.message || 'An unexpected error occurred. Please try again.';
          }
          
          return { 
            success: false, 
            error: errorMessage
          };
        }
      },

      // Signup action
      signup: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/signup', userData);
          
          if (!response || !response.data) {
            throw new Error('Invalid response from server');
          }

          const { access_token, refresh_token } = response.data;
          
          if (!access_token || !refresh_token) {
            throw new Error('Invalid signup response from server');
          }
          
          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set up token refresh timer
          get().startTokenRefreshTimer();
          
          // Fetch user profile
          await get().fetchUserProfile();
          
          return { success: true };
        } catch (error) {
          console.error('Signup error:', error);
          set({ 
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            user: null
          });
          
          let errorMessage = 'Signup failed. Please try again.';
          
          if (error.response) {
            const status = error.response.status;
            const serverMessage = error.response.data?.detail || error.response.data?.message;
            
            switch (status) {
              case 400:
                errorMessage = serverMessage || 'Invalid signup data. Please check your information.';
                break;
              case 409:
                errorMessage = 'An account with this email already exists. Please try logging in instead.';
                break;
              case 429:
                errorMessage = 'Too many signup attempts. Please try again later.';
                break;
              case 500:
                errorMessage = 'Server error. Please try again later.';
                break;
              default:
                errorMessage = serverMessage || `Signup failed (${status}). Please try again.`;
            }
          } else if (error.request) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            errorMessage = error.message || 'An unexpected error occurred. Please try again.';
          }
          
          return { 
            success: false, 
            error: errorMessage
          };
        }
      },

      // Fetch user profile
      fetchUserProfile: async () => {
        try {
          const response = await api.get('/auth/me');
          if (response && response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Don't logout on profile fetch failure, just log the error
          // The user might still have a valid session
        }
      },

      // Refresh token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return false;
        }

        try {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken
          });
          
          if (!response || !response.data) {
            throw new Error('Invalid refresh response');
          }

          const { access_token, refresh_token } = response.data;
          
          if (!access_token) {
            throw new Error('No access token in refresh response');
          }
          
          set({
            accessToken: access_token,
            refreshToken: refresh_token || refreshToken, // Use new refresh token if provided
          });

          // Restart the timer with new token
          get().startTokenRefreshTimer();
          
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
          return false;
        }
      },

      // Start token refresh timer (refresh 5 minutes before expiry)
      startTokenRefreshTimer: () => {
        const { tokenRefreshTimer } = get();
        
        // Clear existing timer
        if (tokenRefreshTimer) {
          clearTimeout(tokenRefreshTimer);
        }

        // JWT tokens typically expire in 30 minutes
        // Refresh 5 minutes before expiry (25 minutes)
        const refreshTime = 25 * 60 * 1000; // 25 minutes in milliseconds
        
        const timer = setTimeout(() => {
          get().refreshAccessToken();
        }, refreshTime);

        set({ tokenRefreshTimer: timer });
      },

      // Logout action
      logout: async () => {
        const { refreshToken, tokenRefreshTimer } = get();
        
        // Clear refresh timer
        if (tokenRefreshTimer) {
          clearTimeout(tokenRefreshTimer);
        }

        // Call logout API if refresh token exists
        if (refreshToken) {
          try {
            await api.post('/auth/logout', { refresh_token: refreshToken });
          } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with logout even if API call fails
          }
        }

        // Clear all auth state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          tokenRefreshTimer: null,
        });
      },

      // Update user profile
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      // Add error handling for localStorage
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth store rehydration error:', error);
          // Clear corrupted storage
          localStorage.removeItem('auth-storage');
        }
      },
    }
  )
);

export default useAuthStore;