/**
 * update-username.js
 *
 * Updates the logged in users username
 * Trims whitespace from the new username before saving
 * Returns a friendly error if the username is already taken
 * by another account due to the unique constraint on the users table
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { newUsername } = req.body;

  try {
    await sql`
      UPDATE users SET username = ${newUsername.trim()}
      WHERE id = ${user.id}
    `;

    res.json({ success: true, data: true });
  } catch (err) {
    // the users table has a unique constraint on username so catch that specifically
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return res.json({ success: false, error: 'Username already taken' });
    }
    res.json({ success: false, error: 'Failed to update username' });
  }
}