const jwt = require('jsonwebtoken');
const { serialize, parse } = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'focusflow-secret';
const COOKIE_NAME = 'focusflow_session';

function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  }));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  }));
}

function getUserFromRequest(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  createToken,
  verifyToken,
  setSessionCookie,
  clearSessionCookie,
  getUserFromRequest,
};