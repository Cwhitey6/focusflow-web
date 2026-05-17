// get.js
const sql = require('../../../lib/db.js');
const { getUserFromRequest } = require('../../../lib/auth.js');

module.exports = async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { projectId } = req.query;

  const rows = await sql`
    SELECT id, project_id, name, position
    FROM lists WHERE project_id=${projectId}
    ORDER BY position ASC
  `;

  res.json({ success: true, data: rows });
};