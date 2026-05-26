const sql = require('../../../lib/db.js');
const { getUserFromRequest } = require('../../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { id, completed } = req.body;

  await sql`
    UPDATE tasks
    SET completed=${completed},
        completed_at=${completed ? new Date().toISOString() : null}
    WHERE id=${id} AND user_id=${user.id}
  `;

  res.json({ success: true, data: true });
};
