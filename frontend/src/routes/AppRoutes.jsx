import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import TherapistLayout from '../layouts/TherapistLayout';
import ClientLayout from '../layouts/ClientLayout';
import PublicLayout from '../layouts/PublicLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import PublicProfilePage from '../pages/public/PublicProfilePage';
import BookingPage from '../pages/public/BookingPage';

// Therapist Pages
import DashboardPage from '../pages/therapist/DashboardPage';
import CalendarPage from '../pages/therapist/CalendarPage';
import ClientsPage from '../pages/therapist/ClientsPage';
import ClientDetailPage from '../pages/therapist/ClientDetailPage';
import NotesPage from '../pages/therapist/NotesPage';
import SubscriptionPage from '../pages/therapist/SubscriptionPage';
import ProfilePage from '../pages/therapist/ProfilePage';

// Client Pages
import ClientPortalPage from '../pages/client/ClientPortalPage';

// Route Guards
const TherapistGuard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-xs text-slate-400">Verifying session...</div>;
  if (!user || user.role !== 'THERAPIST') return <Navigate to="/login" replace />;
  return children;
};

const ClientGuard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-xs text-slate-400">Verifying session...</div>;
  if (!user || user.role !== 'CLIENT') return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/:slug" element={<PublicProfilePage />} />
        <Route path="/:slug/book" element={<BookingPage />} />
      </Route>

      {/* Therapist Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <TherapistGuard>
            <TherapistLayout />
          </TherapistGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Client Portal Protected Routes */}
      <Route
        path="/client"
        element={
          <ClientGuard>
            <ClientLayout />
          </ClientGuard>
        }
      >
        <Route index element={<ClientPortalPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
