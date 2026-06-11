/**
 * projects/delete.js
 *
 * Deletes a project and everything inside it
 * The database CASCADE rules handle deleting all lists tasks and notes
 * automatically so we only need to delete the project row itself
 * The user_id check ensures users can only delete their own projects
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId } = req.body;

  // cascade deletes all lists tasks and notes belonging to this project
  await sql`DELETE FROM projects WHERE id=${projectId} AND user_id=${user.id}`;

  res.json({ success: true, data: true });
}