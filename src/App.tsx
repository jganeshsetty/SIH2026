import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { TransporterDashboard } from './pages/TransporterDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MultilingualVoiceBar } from './components/MultilingualVoiceBar';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />

          <Route
            path="/farmer"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'FARMER']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'BUYER']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transporter"
            element={
              <ProtectedRoute allowedRoles={['transporter', 'TRANSPORT_DRIVER', 'driver']}>
                <TransporterDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <MultilingualVoiceBar />
      </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
