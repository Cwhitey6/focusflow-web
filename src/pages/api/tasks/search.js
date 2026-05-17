const sql = require('../../../lib/db.js');
const { getUserFromRequest } = require('../../../lib/auth.js');

module.exports = async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { query } = req.query;
  const pattern = `%${query.toLowerCase()}%`;

  const rows = await sql`
    SELECT id, list_id, project_id, user_id, title, description,
           due_date, priority, completed, completed_at, position, created_at
    FROM tasks
    WHERE user_id=${user.id}
      AND (LOWER(title) LIKE ${pattern} OR LOWER(description) LIKE ${pattern})
    ORDER BY completed ASC, created_at DESC
    LIMIT 50
  `;

  res.json({ success: true, data: rows });
};