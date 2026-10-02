import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import CookieConsent from './components/common/CookieConsent';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

