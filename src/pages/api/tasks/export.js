/**
 * tasks/export.js
 *
 * Returns all tasks for the logged in user as a flat list
 * Used by the settings page to let the user download their data as JSON
 * Ordered by creation date with newest tasks first
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  // fetch every task across all projects for the export
  const rows = await sql`
    SELECT id, list_id, project_id, user_id, title, description,
           due_date, priority, completed, completed_at, position, created_at
    FROM tasks WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;

  res.json({ success: true, data: rows });
}