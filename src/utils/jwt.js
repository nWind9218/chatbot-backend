const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {String} type - Token type ('access' or 'refresh' or 'validate')
 * @returns {String} JWT token
 */
const generateToken = (payload, type = 'access') => {
  const secret = type === 'refresh' ? config.JWT_REFRESH_SECRET : type ==='validate'? config.JWT_VALIDATE_SECRET : config.JWT_SECRET;
  const expiresIn = type === 'refresh' ? config.JWT_REFRESH_EXPIRES_IN : type === 'validate'? config.JWT_VALIDATE_EXPIRES_IN : config.JWT_EXPIRES_IN;
  console.log(expiresIn)
  return jwt.sign(payload, secret, { expiresIn });
};

  /**
 * Verify JWT tokens
 * @param {String} token - JWT token
 * @param {String} type - Token type ('access' or 'refresh' or 'validate')
 * @returns {Object} Decoded token payload
 */ 
const verifyToken = (token, type = 'access') => {
  const secret = type === 'refresh' ? config.JWT_REFRESH_SECRET : type === 'validate' ? config.JWT_VALIDATE_SECRET : config.JWT_SECRET;
  const payload = jwt.verify(token, secret);
  // console.log('as ',payload)
  return payload
};
/**
 * Decode to get payload, when you know token expired already
 * @param {String} token  - JWT Token
 */
const decodePayload = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded) return null; // hoặc throw new Error("Invalid token")
  const { exp, iat, ...payload } = decoded;
  return payload;
};
/**
 * Generate tokens pair (access + refresh)
 * @param {Object} user - User object
 * @returns {Object} Tokens object
 */
const generateTokenPair = (user) => {
  return {
    accessToken: generateToken(user, 'access'),
    refreshToken: generateToken(user, 'refresh'),
  };
};

module.exports = {
  generateToken,
  verifyToken,
  decodePayload,
  generateTokenPair,
};
