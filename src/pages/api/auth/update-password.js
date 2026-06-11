/**
 * update-password.js
 *
 * Updates the logged in users password
 * Requires the current password to be correct before allowing the change
 * This prevents someone who finds an unlocked browser from changing the password
 * The new password is hashed before being stored just like on registration
 */

import bcrypt from 'bcryptjs';
import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { currentPassword, newPassword } = req.body;

  try {
    // fetch the stored hash so we can verify the current password
    const rows = await sql`
      SELECT password_hash FROM users WHERE id = ${user.id}
    `;

    // reject the request if the current password doesnt match
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.json({ success: false, error: 'Current password is incorrect' });
    }

    // hash the new password and save it
    const newHash = await bcrypt.hash(newPassword, 12);
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`;

    res.json({ success: true, data: true });
  } catch {
    res.json({ success: false, error: 'Failed to update password' });
  }
}