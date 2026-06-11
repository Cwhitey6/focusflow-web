/**
 * tasks/create.js
 *
 * Creates a new task inside a specific list and project
 * Description defaults to empty string and priority defaults to normal
 * if not provided so the caller only needs to pass a title at minimum
 * Returns the new task id so the client can build the local task object
 */

import { v4 as uuid } from 'uuid';
import sql from '../../../lib/db.js';
import { getUserFromRequest } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { listId, projectId, title, description, dueDate, priority } = req.body;
  const id = uuid();

  await sql`
    INSERT INTO tasks
    (id, list_id, project_id, user_id, title, description, due_date, priority)
    VALUES (
      ${id}, ${listId}, ${projectId}, ${user.id},
      ${title}, ${description || ''}, ${dueDate || null}, ${priority || 'normal'}
    )
  `;

  // return the new id so the client can add the task to local state immediately
  res.json({ success: true, data: id });
}