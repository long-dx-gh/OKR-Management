import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { LoginPage } from '../components/auth/LoginPage'
import { SignUpPage } from '../components/auth/SignUpPage'
import { OKRVisualizationPage } from '../components/visualization/OKRVisualizationPage'
import App from './App.tsx'
import '../styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          
          {/* OKR Visualization Page */}
          <Route
            path="/visualization"
            element={
              <ProtectedRoute>
                <OKRVisualizationPage />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
