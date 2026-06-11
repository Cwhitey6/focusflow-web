/**
 * lists/get.js
 *
 * Returns all lists for a given project ordered by position
 * Lists are the kanban columns like To Do In Progress and Done
 * The projectId is passed as a query param since this is a GET style request
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId } = req.query;

  // fetch all lists for the project sorted by their display order
  const rows = await sql`
    SELECT id, project_id, name, position
    FROM lists WHERE project_id=${projectId}
    ORDER BY position ASC
  `;

  res.json({ success: true, data: rows });
}