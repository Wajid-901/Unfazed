import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const TherapistLayout = () => {
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.includes('/calendar')) return 'Calendar & Appointments';
    if (path.includes('/clients/')) return 'Client Details';
    if (path.includes('/clients')) return 'Client Management (CRM)';
    if (path.includes('/notes')) return 'Clinical Notes & Templates';
    if (path.includes('/subscription')) return 'Subscription & Plan Limits';
    if (path.includes('/profile')) return 'Practice Profile & Clinic Details';
    return 'Practice Overview';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar pageTitle={getPageTitle(location.pathname)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TherapistLayout;
