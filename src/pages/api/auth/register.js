/**
 * register.js
 *
 * Creates a new user account with a hashed password
 * After inserting the user an Inbox project is automatically created
 * so the user has somewhere to drop tasks right away without making a project
 * On success the user is logged in immediately via a session cookie
 */

import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import sql from '../../../lib/db.js';
import { createToken, setSessionCookie } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, error: 'Missing fields' });
  }

  try {
    // hash the password with a cost factor of 12 before storing it
    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuid();

    await sql`
      INSERT INTO users (id, username, password_hash)
      VALUES (${id}, ${username.trim()}, ${passwordHash})
    `;

    // auto-create an inbox project so the user can capture tasks immediately
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

    // log the user in right away so they dont have to sign in after registering
    const token = createToken({ id, username: username.trim() });
    setSessionCookie(res, token);

    return res.json({
      success: true,
      data: { id, username: username.trim() }
    });
  } catch (err) {
    // catch duplicate username errors from the unique constraint
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return res.json({ success: false, error: 'Username already taken' });
    }
    console.error(err);
    return res.json({ success: false, error: 'Registration failed' });
  }
}