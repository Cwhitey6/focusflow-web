const bcrypt = require('bcryptjs');
const sql = require('../../../lib/db.js');
const { getUserFromRequest } = require('../../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { currentPassword, newPassword } = req.body;

  try {
    const rows = await sql`
      SELECT password_hash FROM users WHERE id = ${user.id}
    `;
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.json({ success: false, error: 'Current password is incorrect' });
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`;
    res.json({ success: true, data: true });
  } catch (err) {
    res.json({ success: false, error: 'Failed to update password' });
  }
};