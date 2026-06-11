/**
 * auth.js
 *
 * Handles JWT session management for the app
 * After a successful login a signed token is stored in an HTTP only cookie
 * HTTP only means JavaScript on the client cannot read it which prevents XSS attacks
 * The token expires after 30 days and is verified on every API request
 */

import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'focusflow-secret';
const COOKIE_NAME = 'focusflow_session';

// creates a signed JWT containing the users id and username
export function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// verifies a token and returns the payload or null if invalid or expired
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// sets the session cookie on the response
// secure flag is only true in production so local dev still works over http
export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    path: '/',
  }));
}

// overwrites the cookie with an empty value and zero max age to clear it
export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  }));
}

// reads the session cookie from the request and returns the decoded user or null
export function getUserFromRequest(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}