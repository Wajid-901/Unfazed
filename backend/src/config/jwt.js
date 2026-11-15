const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const configuredAccessSecret = process.env.JWT_SECRET;
const configuredRefreshSecret = process.env.REFRESH_TOKEN_SECRET;

if (process.env.NODE_ENV === 'production') {
  const isStrongSecret = (secret) =>
    typeof secret === 'string' &&
    secret.length >= 32 &&
    !/(placeholder|replace|your[_ -])/i.test(secret);

  if (
    !isStrongSecret(configuredAccessSecret) ||
    !isStrongSecret(configuredRefreshSecret) ||
    configuredAccessSecret === configuredRefreshSecret
  ) {
    throw new Error(
      'Production requires distinct JWT_SECRET and REFRESH_TOKEN_SECRET values with at least 32 non-placeholder characters.'
    );
  }
}

const JWT_SECRET = configuredAccessSecret || crypto.randomBytes(32).toString('hex');
const REFRESH_SECRET = configuredRefreshSecret || crypto.randomBytes(32).toString('hex');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshCookieOptions
};
