const { v4: uuid } = require('uuid');
const sql = require('../../lib/db.js');
const { getUserFromRequest } = require('../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { id, title, description, dueDate, priority } = req.body;

  try {
    await sql`
      UPDATE tasks
      SET title=${title}, description=${description},
          due_date=${dueDate || null}, priority=${priority}
      WHERE id=${id} AND user_id=${user.id}
    `;
    res.json({ success: true, data: true });
  } catch (err) {
    console.error('Update task error:', err);
    res.json({ success: false, error: err.message });
  }
};
