/**
 * tasks/delete.js
 *
 * Permanently deletes a task
 * The user_id check ensures users can only delete their own tasks
 * Any notes or tag associations are removed automatically via cascade
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { id } = req.body;

  // cascade removes any notes or task_tags rows attached to this task
  await sql`DELETE FROM tasks WHERE id=${id} AND user_id=${user.id}`;

  res.json({ success: true, data: true });
}