/**
 * me.js
 *
 * Returns the currently logged in user based on their session cookie
 * Used on app load to check if a valid session exists without asking
 * the user to log in again
 * Returns 401 style error if no valid cookie is found
 */

import { getUserFromRequest } from '../../../lib/auth.js';

export default function handler(req, res) {
  const user = getUserFromRequest(req);

  // no valid session cookie means the user is not logged in
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  res.json({ success: true, data: { id: user.id, username: user.username } });
}