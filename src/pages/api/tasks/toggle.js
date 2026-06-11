/**
 * tasks/toggle.js
 *
 * Marks a task as complete or incomplete
 * Sets completed_at to the current timestamp when completing
 * and clears it back to null when marking incomplete again
 * The user_id check ensures users can only toggle their own tasks
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { id, completed } = req.body;

  // store the completion timestamp when checking off a task
  // clear it when the task is marked incomplete again
  await sql`
    UPDATE tasks
    SET completed=${completed},
        completed_at=${completed ? new Date().toISOString() : null}
    WHERE id=${id} AND user_id=${user.id}
  `;

  res.json({ success: true, data: true });
}