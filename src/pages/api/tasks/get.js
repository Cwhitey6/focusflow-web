/**
 * tasks/get.js
 *
 * Returns all tasks for a given project ordered by position
 * Position determines the display order within each list
 * The projectId is passed as a query param since this is a GET style request
 * Both completed and incomplete tasks are returned so the client can filter
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId } = req.query;

  // fetch all tasks for the project sorted by their position within each list
  const rows = await sql`
    SELECT id, list_id, project_id, user_id, title, description,
           due_date, priority, completed, completed_at, position, created_at
    FROM tasks WHERE project_id=${projectId}
    ORDER BY position ASC
  `;

  res.json({ success: true, data: rows });
}