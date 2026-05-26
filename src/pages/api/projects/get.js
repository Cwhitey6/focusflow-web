const sql = require('../../lib/db.js');
const { getUserFromRequest } = require('../../lib/auth.js');

module.exports = async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const rows = await sql`
    SELECT id, user_id, name, color, icon, created_at, archived
    FROM projects WHERE user_id = ${user.id} AND archived = false
    ORDER BY created_at ASC
  `;

  res.json({ success: true, data: rows });
};
