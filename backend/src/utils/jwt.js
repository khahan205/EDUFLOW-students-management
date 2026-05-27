import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign 1 JWT với payload {id, username, role}. Expire theo env.JWT_EXPIRES_IN.
 */
export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verify token. Throw JsonWebTokenError nếu invalid/expired.
 */
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
