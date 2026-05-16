const { getUserFromRequest } = require('../../../lib/auth.js');

module.exports = function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });
  res.json({ success: true, data: { id: user.id, username: user.username } });
};