/**
 * projects/get.js
 *
 * Returns all active projects for the logged in user
 * Archived projects are excluded since they are hidden from the sidebar
 * Results are ordered by position so the user's drag order is preserved
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  // include parent_id so the frontend can build the nested tree structure
  const rows = await sql`
    SELECT id, user_id, name, color, icon, created_at, archived, position, parent_id
    FROM projects WHERE user_id = ${user.id} AND archived = false
    ORDER BY position ASC, created_at ASC
  `;

  res.json({ success: true, data: rows });
}