/**
 * tasks/update.js
 *
 * Updates the editable fields of a task
 * Called from the task detail drawer whenever the user saves changes
 * Due date can be cleared by passing null
 * The user_id check ensures users can only edit their own tasks
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { id, title, description, dueDate, priority } = req.body;

  try {
    await sql`
      UPDATE tasks
      SET title=${title}, description=${description},
          due_date=${dueDate || null}, priority=${priority}
      WHERE id=${id} AND user_id=${user.id}
    `;

    res.json({ success: true, data: true });
  } catch (err) {
    console.error('Update task error:', err);
    res.json({ success: false, error: err.message });
  }
}