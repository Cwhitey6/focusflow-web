/**
 * tasks/get.js
 *
 * Returns all tasks for a given project ordered by priority then position
 * Priority order is urgent first then high normal and low
 * The projectId is passed as a query param since this is a GET style request
 * Both completed and incomplete tasks are returned so the client can filter
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId } = req.query;

  // sort by priority first then by position within each priority level
  const rows = await sql`
    SELECT id, list_id, project_id, user_id, title, description,
           due_date, priority, completed, completed_at, position, created_at
    FROM tasks WHERE project_id=${projectId}
    ORDER BY
      CASE priority
        WHEN 'urgent' THEN 0
        WHEN 'high'   THEN 1
        WHEN 'normal' THEN 2
        WHEN 'low'    THEN 3
      END ASC,
      position ASC
  `;

  res.json({ success: true, data: rows });
}