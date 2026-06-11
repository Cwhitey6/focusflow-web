/**
 * tasks/move.js
 *
 * Moves a task to a different list (kanban column)
 * Called when the user changes the status badge on a task row
 * or drags a card to a different column on the board view
 * The user_id check ensures users can only move their own tasks
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { taskId, newListId } = req.body;

  // update the list_id to move the task into the new column
  await sql`
    UPDATE tasks SET list_id=${newListId}
    WHERE id=${taskId} AND user_id=${user.id}
  `;

  res.json({ success: true, data: true });
}