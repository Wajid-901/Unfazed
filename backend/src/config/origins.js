const PRODUCTION_ORIGINS = [
  'https://unfazed.in',
  'https://www.unfazed.in',
  'https://app.unfazed.in',
  'https://unfazed-umber.vercel.app'
];

const DEVELOPMENT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

const getAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.CLIENT_URL,
    ...(process.env.ALLOWED_ORIGINS || '').split(',')
  ].filter(Boolean).map((origin) => origin.trim()).filter(Boolean);
  const developmentOrigins = process.env.NODE_ENV === 'production'
    ? []
    : DEVELOPMENT_ORIGINS;

  return [...new Set([
    ...PRODUCTION_ORIGINS,
    ...developmentOrigins,
    ...configuredOrigins
  ])];
};

module.exports = getAllowedOrigins;
