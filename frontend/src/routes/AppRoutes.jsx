import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TherapistLayout = lazy(() => import('../layouts/TherapistLayout'));
const ClientLayout = lazy(() => import('../layouts/ClientLayout'));
const PublicLayout = lazy(() => import('../layouts/PublicLayout'));

const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const SetupPasswordPage = lazy(() => import('../pages/auth/SetupPasswordPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/public/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('../pages/public/TermsPage'));
const PublicProfilePage = lazy(() => import('../pages/public/PublicProfilePage'));
const BookingPage = lazy(() => import('../pages/public/BookingPage'));
const TherapistsPage = lazy(() => import('../pages/public/TherapistsPage'));

const DashboardPage = lazy(() => import('../pages/therapist/DashboardPage'));
const CalendarPage = lazy(() => import('../pages/therapist/CalendarPage'));
const ClientsPage = lazy(() => import('../pages/therapist/ClientsPage'));
const ClientDetailPage = lazy(() => import('../pages/therapist/ClientDetailPage'));
const PaymentsPage = lazy(() => import('../pages/therapist/PaymentsPage'));
const AnalyticsPage = lazy(() => import('../pages/therapist/AnalyticsPage'));
const ChatPage = lazy(() => import('../pages/therapist/ChatPage'));
const SubscriptionPage = lazy(() => import('../pages/therapist/SubscriptionPage'));
const ProfilePage = lazy(() => import('../pages/therapist/ProfilePage'));

const ClientDashboardPage = lazy(() => import('../pages/client/ClientDashboardPage'));
const ClientBookingsPage = lazy(() => import('../pages/client/ClientBookingsPage'));
const ClientPaymentsPage = lazy(() => import('../pages/client/ClientPaymentsPage'));
const ClientProfilePage = lazy(() => import('../pages/client/ClientProfilePage'));
const ClientChatPage = lazy(() => import('../pages/client/ClientChatPage'));
const ClientInvoicePage = lazy(() => import('../pages/client/ClientInvoicePage'));

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
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading page...</div>}>
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
        <Route path="profile" element={<ClientProfilePage />} />
        <Route path="chat" element={<ClientChatPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
