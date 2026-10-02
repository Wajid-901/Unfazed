import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const pageTitles = {
  '/calendar': 'Calendar & Appointments',
  '/clients/': 'Client Details',
  '/clients': 'Client Management (CRM)',
  '/notes': 'Clinical Notes & Templates',
  '/chat': 'Direct Chat',
  '/payments': 'Payments & Billing',
  '/analytics': 'Practice Analytics',
  '/subscription': 'Subscription & Plan Limits',
  '/profile': 'Practice Profile & Clinic Details'
};

const getPageTitle = (path) => {
  for (const [key, title] of Object.entries(pageTitles)) {
    if (path.includes(key)) return title;
  }
  return 'Practice Overview';
};

const TherapistLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content area — lg: offset for fixed sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Navbar
          pageTitle={getPageTitle(location.pathname)}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TherapistLayout;
