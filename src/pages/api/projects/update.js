/**
 * projects/update.js
 *
 * Updates the name color and icon of an existing project
 * The user_id check ensures users can only edit their own projects
 */

import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId, name, color, icon } = req.body;

  // update only the visual fields - id and user_id never change
  await sql`
    UPDATE projects SET name=${name}, color=${color}, icon=${icon}
    WHERE id=${projectId} AND user_id=${user.id}
  `;

  res.json({ success: true, data: true });
}