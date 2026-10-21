import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import CookieConsent from './components/common/CookieConsent';
import ScrollToTop from './components/common/ScrollToTop';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
        <CookieConsent />
      </AuthProvider>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;

