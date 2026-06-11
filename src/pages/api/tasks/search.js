/**
 * tasks/search.js
 *
 * Searches tasks by title and description using a text query
 * Converts both the query and stored values to lowercase for case insensitive matching
 * Incomplete tasks are shown before completed ones in the results
 * Results are capped at 50 to keep the response fast
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { query } = req.query;

  // wrap the query in wildcards so it matches anywhere in the title or description
  const pattern = `%${query.toLowerCase()}%`;

  const rows = await sql`
    SELECT id, list_id, project_id, user_id, title, description,
           due_date, priority, completed, completed_at, position, created_at
    FROM tasks
    WHERE user_id=${user.id}
      AND (LOWER(title) LIKE ${pattern} OR LOWER(description) LIKE ${pattern})
    ORDER BY completed ASC, created_at DESC
    LIMIT 50
  `;

  res.json({ success: true, data: rows });
}