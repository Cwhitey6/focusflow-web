/**
 * projects/inbox.js
 *
 * Returns the special Inbox project for the logged in user
 * Every account gets an Inbox created automatically on registration
 * It is used for quick task capture without needing to pick a project
 * Returns null if for some reason the inbox doesnt exist yet
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  // find the inbox project by name since it is always called Inbox
  const rows = await sql`
    SELECT id, user_id, name, color, icon, created_at, archived
    FROM projects WHERE user_id=${user.id} AND name='Inbox'
    ORDER BY created_at ASC LIMIT 1
  `;

  // return null instead of an empty array if no inbox exists
  res.json({ success: true, data: rows[0] || null });
}