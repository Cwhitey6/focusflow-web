/**
 * tasks/reorder.js
 *
 * Updates the position of tasks after a drag and drop reorder
 * Expects an ordered array of task ids and updates each ones position
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { taskIds } = req.body;

  for (let i = 0; i < taskIds.length; i++) {
    await sql`
      UPDATE tasks SET position = ${i}
      WHERE id = ${taskIds[i]} AND user_id = ${user.id}
    `;
  }

  res.json({ success: true, data: true });
}