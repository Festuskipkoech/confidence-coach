import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Store
import useAuthStore from './store/authStore';

// Components
import SplashScreen from './components/SplashScreen';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';

import DashboardPage from './pages/DashboardPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ProfilePage from './pages/ProfilePage';
import { Analytics } from '@vercel/analytics/react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when app loads
    const initialize = async () => {
      try {
        // Add a longer delay to prevent any flashing effects
        await new Promise(resolve => setTimeout(resolve, 800));
        
        await initializeAuth();
        
        // Additional delay after auth initialization
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if user should see splash
        const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
        const shouldShowSplash = !isAuthenticated && !hasSeenSplash;
        
        if (shouldShowSplash) {
          setShowSplash(true);
        }
        
      } catch (error) {
        console.error('App initialization error:', error);
        // Continue with initialization even if there's an error
      } finally {
        setAuthInitialized(true);
        setInitialLoadComplete(true);
      }
    };
    
    initialize();
  }, [initializeAuth]);

  // Update splash screen visibility when auth status changes
  useEffect(() => {
    if (authInitialized && initialLoadComplete) {
      const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
      
      // If user becomes authenticated while splash is showing, hide it
      if (isAuthenticated && showSplash) {
        setShowSplash(false);
        sessionStorage.setItem('hasSeenSplash', 'true');
      }
      // If user becomes unauthenticated and hasn't seen splash, show it
      else if (!isAuthenticated && !hasSeenSplash && !showSplash) {
        // Only show splash if we're not already on an auth page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          setShowSplash(true);
        }
      }
    }
  }, [isAuthenticated, authInitialized, initialLoadComplete, showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Mark that user has seen splash in this session
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  // Show loading screen until initial load is complete
  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <AnimatePresence mode="wait">
            {showSplash ? (
              <SplashScreen key="splash" onComplete={handleSplashComplete} />
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen"
              >
                <Routes>
                  {/* Public Routes */}
                  <Route 
                    path="/login" 
                    element={
                      isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <LoginPage />
                      )
                    } 
                  />
                  <Route 
                    path="/signup" 
                    element={
                      isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <SignupPage />
                      )
                    } 
                  />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="assessments" element={<AssessmentsPage />} />
                    <Route path="assessments/*" element={<AssessmentsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>

                  {/* Catch-all Route - Prevent 404 errors */}
                  <Route 
                    path="*" 
                    element={
                      // Wait for auth to be initialized before redirecting
                      !authInitialized ? (
                        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
                          <div className="text-gray-600 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p>Loading...</p>
                          </div>
                        </div>
                      ) : isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    } 
                  />
                </Routes>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
      <Analytics/>
    </QueryClientProvider>
  );
}

export default App;