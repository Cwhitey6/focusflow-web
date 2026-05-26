const sql = require('../../../lib/db.js');
const { getUserFromRequest } = require('../../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { newUsername } = req.body;

  try {
    await sql`
      UPDATE users SET username = ${newUsername.trim()}
      WHERE id = ${user.id}
    `;
    res.json({ success: true, data: true });
  } catch (err) {
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return res.json({ success: false, error: 'Username already taken' });
    }
    res.json({ success: false, error: 'Failed to update username' });
  }
};
