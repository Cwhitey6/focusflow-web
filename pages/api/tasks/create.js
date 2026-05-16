const { v4: uuid } = require('uuid');
const sql = require('../../../lib/db.js');
const { getUserFromRequest } = require('../../../lib/auth.js');

module.exports = async function handler(req, res) {
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

  res.json({ success: true, data: id });
};