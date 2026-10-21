const PLANS = {
  FREE: {
    key: 'FREE',
    name: 'Free Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: {
      maxClients: 5,
      maxStorageMB: 100,
      analyticsLevel: 'BASIC'
    },
    features: [
      'calendar_basic',
      'notes_standard',
      'manual_payments'
    ]
  },
  STARTER: {
    key: 'STARTER',
    name: 'Starter Practice',
    monthlyPrice: 999,
    annualPrice: 9990,
    limits: {
      maxClients: 25,
      maxStorageMB: 500,
      analyticsLevel: 'STANDARD'
    },
    features: [
      'calendar_basic',
      'public_booking_page',
      'razorpay_payments',
      'notes_standard',
      'soap_templates',
      'intake_forms'
    ]
  },
  PRO: {
    key: 'PRO',
    name: 'Professional Clinic',
    monthlyPrice: 2499,
    annualPrice: 24990,
    limits: {
      maxClients: 10000,
      maxStorageMB: 5000,
      analyticsLevel: 'ADVANCED'
    },
    features: [
      'calendar_basic',
      'public_booking_page',
      'razorpay_payments',
      'notes_standard',
      'soap_templates',
      'dap_templates',
      'intake_forms',
      'realtime_chat',
      'shared_client_portal',
      'advanced_analytics',
      'automated_invoices',
      'packages'
    ]
  },
  ENTERPRISE: {
    key: 'ENTERPRISE',
    name: 'Enterprise / Clinic Group',
    monthlyPrice: 5999,
    annualPrice: 59990,
    limits: {
      maxClients: 100000,
      maxStorageMB: 50000,
      analyticsLevel: 'ENTERPRISE'
    },
    features: [
      'calendar_basic',
      'public_booking_page',
      'razorpay_payments',
      'notes_standard',
      'soap_templates',
      'dap_templates',
      'intake_forms',
      'realtime_chat',
      'shared_client_portal',
      'advanced_analytics',
      'automated_invoices',
      'packages',
      'custom_domain',
      'priority_support'
    ]
  }
};

module.exports = PLANS;
