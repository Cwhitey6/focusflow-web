/**
 * projects/move.js
 *
 * Updates the parent_id of a project to move it into or out of another project
 * Passing null as the new parentId moves it back to the top level
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId, newParentId } = req.body;

  // prevent a project from being moved into itself
  if (projectId === newParentId) {
    return res.json({ success: false, error: 'Cannot move a project into itself' });
  }

  await sql`
    UPDATE projects SET parent_id = ${newParentId}
    WHERE id = ${projectId} AND user_id = ${user.id}
  `;

  res.json({ success: true, data: true });
}