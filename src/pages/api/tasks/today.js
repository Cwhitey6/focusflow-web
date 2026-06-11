/**
 * tasks/today.js
 *
 * Returns all incomplete tasks due today across every project
 * Used by the My Day view to show the users daily focus list
 * Results are sorted by priority first then creation date
 * so urgent tasks always appear at the top
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  // cast due_date to date to ignore the time portion when comparing to today
  const rows = await sql`
    SELECT id, list_id, project_id, user_id, title, description,
           due_date, priority, completed, completed_at, position, created_at
    FROM tasks
    WHERE user_id=${user.id}
      AND completed=false
      AND due_date::date = CURRENT_DATE
    ORDER BY priority ASC, created_at ASC
  `;

  res.json({ success: true, data: rows });
}