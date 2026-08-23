/**
 * projects/reorder.js
 *
 * Updates the position of every project for the logged in user
 * Called after the user drops a project into a new position in the sidebar
 * Expects an ordered array of project ids and updates each one's position
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectIds } = req.body;

  // update each project's position based on its index in the array
  for (let i = 0; i < projectIds.length; i++) {
    await sql`
      UPDATE projects SET position = ${i}
      WHERE id = ${projectIds[i]} AND user_id = ${user.id}
    `;
  }

  res.json({ success: true, data: true });
}