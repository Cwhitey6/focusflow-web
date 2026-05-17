const { v4: uuid } = require('uuid');
const sql = require('../../../lib/db.js');
const { getUserFromRequest } = require('../../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { name, color, icon } = req.body;
  const id = uuid();

  await sql`
    INSERT INTO projects (id, user_id, name, color, icon)
    VALUES (${id}, ${user.id}, ${name}, ${color}, ${icon})
  `;

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
};