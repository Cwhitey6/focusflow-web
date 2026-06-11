/**
 * logout.js
 *
 * Clears the session cookie to log the user out
 * Works by overwriting the cookie with an empty value and a max age of zero
 * which tells the browser to delete it immediately
 */

import { clearSessionCookie } from '../../../lib/auth.js';

export default function handler(req, res) {
  clearSessionCookie(res);
  res.json({ success: true });
}