/**
 * projects/create.js
 *
 * Creates a new project for the logged in user
 * After inserting the project three default kanban columns are created
 * automatically so the board is ready to use straight away
 */

import { v4 as uuid } from 'uuid';
import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { name, color, icon } = req.body;
  const id = uuid();

  // insert the project
  await sql`
    INSERT INTO projects (id, user_id, name, color, icon)
    VALUES (${id}, ${user.id}, ${name}, ${color}, ${icon})
  `;

  // auto-create the three default kanban columns in order
  const columns = [
    { name: 'To Do', position: 0 },
    { name: 'In Progress', position: 1 },
    { name: 'Done', position: 2 },
  ];

  for (const col of columns) {
    await sql`
      INSERT INTO lists (id, project_id, name, position)
      VALUES (${uuid()}, ${id}, ${col.name}, ${col.position})
    `;
  }

  res.json({ success: true, data: id });
}