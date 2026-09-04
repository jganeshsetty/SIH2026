import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { FarmerDashboard } from './pages/FarmerDashboard.tsx';
import { BuyerDashboard } from './pages/BuyerDashboard.tsx';
import { TransporterDashboard } from './pages/TransporterDashboard.tsx';
import { AiAssistant } from './components/AiAssistant.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/buyer" element={<BuyerDashboard />} />
          <Route path="/transporter" element={<TransporterDashboard />} />
        </Routes>
        <AiAssistant />
      </BrowserRouter>
    </AuthProvider>
  );
}
