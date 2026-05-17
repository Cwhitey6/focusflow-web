const bcrypt = require('bcryptjs');
const sql = require('../../../lib/db.js');
const { createToken, setSessionCookie } = require('../../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  try {
    const rows = await sql`
      SELECT id, username, password_hash
      FROM users WHERE username = ${username.trim()}
    `;

    if (rows.length === 0) {
      return res.json({ success: false, error: 'Invalid username or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.json({ success: false, error: 'Invalid username or password' });
    }

    const token = createToken({ id: user.id, username: user.username });
    setSessionCookie(res, token);

    return res.json({
      success: true,
      data: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, error: 'Login failed' });
  }
};