const { clearSessionCookie } = require('../../../lib/auth.js');

module.exports = function handler(req, res) {
  clearSessionCookie(res);
  res.json({ success: true });
};