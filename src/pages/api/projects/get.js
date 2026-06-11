/**
 * projects/get.js
 *
 * Returns all active projects for the logged in user
 * Archived projects are excluded since they are hidden from the sidebar
 * Results are ordered by creation date so older projects appear first
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  // only return non-archived projects ordered oldest first
  const rows = await sql`
    SELECT id, user_id, name, color, icon, created_at, archived
    FROM projects WHERE user_id = ${user.id} AND archived = false
    ORDER BY created_at ASC
  `;

  res.json({ success: true, data: rows });
}