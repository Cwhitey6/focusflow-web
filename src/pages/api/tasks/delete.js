const sql = require('../../lib/db.js');
const { getUserFromRequest } = require('../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { id } = req.body;

  await sql`DELETE FROM tasks WHERE id=${id} AND user_id=${user.id}`;

  res.json({ success: true, data: true });
};
