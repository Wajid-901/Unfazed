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
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import SetupPasswordPage from '../pages/auth/SetupPasswordPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';
import TermsPage from '../pages/public/TermsPage';
import PublicProfilePage from '../pages/public/PublicProfilePage';
import BookingPage from '../pages/public/BookingPage';
import TherapistsPage from '../pages/public/TherapistsPage';

// Therapist Pages
import DashboardPage from '../pages/therapist/DashboardPage';
import CalendarPage from '../pages/therapist/CalendarPage';
import ClientsPage from '../pages/therapist/ClientsPage';
import ClientDetailPage from '../pages/therapist/ClientDetailPage';
import NotesPage from '../pages/therapist/NotesPage';
import PaymentsPage from '../pages/therapist/PaymentsPage';
import AnalyticsPage from '../pages/therapist/AnalyticsPage';
import ChatPage from '../pages/therapist/ChatPage';
import SubscriptionPage from '../pages/therapist/SubscriptionPage';
import ProfilePage from '../pages/therapist/ProfilePage';

// Client Pages
import ClientDashboardPage from '../pages/client/ClientDashboardPage';
import ClientBookingsPage from '../pages/client/ClientBookingsPage';
import ClientPaymentsPage from '../pages/client/ClientPaymentsPage';
import ClientNotesPage from '../pages/client/ClientNotesPage';
import ClientProfilePage from '../pages/client/ClientProfilePage';
import ClientChatPage from '../pages/client/ClientChatPage';
import ClientInvoicePage from '../pages/client/ClientInvoicePage';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/client/setup-password" element={<SetupPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/therapists" element={<TherapistsPage />} />
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
        <Route path="chat" element={<ChatPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
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
        <Route index element={<ClientDashboardPage />} />
        <Route path="bookings" element={<ClientBookingsPage />} />
        <Route path="payments" element={<ClientPaymentsPage />} />
        <Route path="invoice/:id" element={<ClientInvoicePage />} />
        <Route path="notes" element={<ClientNotesPage />} />
        <Route path="profile" element={<ClientProfilePage />} />
        <Route path="chat" element={<ClientChatPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
