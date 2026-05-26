const sql = require('../../lib/db.js');
const { getUserFromRequest } = require('../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId } = req.body;

  await sql`DELETE FROM projects WHERE id=${projectId} AND user_id=${user.id}`;

  res.json({ success: true, data: true });
};
