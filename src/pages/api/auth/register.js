const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const sql = require('../../lib/db.js');
const { createToken, setSessionCookie } = require('../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, error: 'Missing fields' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuid();

    await sql`
      INSERT INTO users (id, username, password_hash)
      VALUES (${id}, ${username.trim()}, ${passwordHash})
    `;

    const inboxId = uuid();
    const inboxListId = uuid();

    await sql`
      INSERT INTO projects (id, user_id, name, color, icon)
      VALUES (${inboxId}, ${id}, 'Inbox', '#6b7280', '📥')
    `;

    await sql`
      INSERT INTO lists (id, project_id, name, position)
      VALUES (${inboxListId}, ${inboxId}, 'Tasks', 0)
    `;

    const token = createToken({ id, username: username.trim() });
    setSessionCookie(res, token);

    return res.json({
      success: true,
      data: { id, username: username.trim() }
    });
  } catch (err) {
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return res.json({ success: false, error: 'Username already taken' });
    }
    console.error(err);
    return res.json({ success: false, error: 'Registration failed' });
  }
};
