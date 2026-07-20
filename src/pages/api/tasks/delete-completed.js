/**
 * tasks/delete-completed.js
 *
 * Deletes all completed tasks for a given project at once
 * Used by the clear all button in the completed section
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId } = req.body;

  await sql`
    DELETE FROM tasks
    WHERE project_id=${projectId} AND user_id=${user.id} AND completed=true
  `;

  res.json({ success: true, data: true });
}