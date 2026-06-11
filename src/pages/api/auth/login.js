/**
 * login.js
 *
 * Authenticates an existing user with their username and password
 * Looks up the user by username then uses bcrypt to compare the password
 * against the stored hash without ever decrypting it
 * On success a signed JWT is stored in an HTTP only session cookie
 */

import bcrypt from 'bcryptjs';
import sql from '../../../lib/db.js';
import { createToken, setSessionCookie } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  try {
    // look up the user by username
    const rows = await sql`
      SELECT id, username, password_hash
      FROM users WHERE username = ${username.trim()}
    `;

    // return the same error for both wrong username and wrong password
    // this prevents leaking whether an account exists
    if (rows.length === 0) {
      return res.json({ success: false, error: 'Invalid username or password' });
    }

    const user = rows[0];

    // bcrypt compare checks the plain password against the stored hash
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.json({ success: false, error: 'Invalid username or password' });
    }

    // create a JWT and set it as an HTTP only cookie so the client stays logged in
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
}