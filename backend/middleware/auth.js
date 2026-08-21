const jwt = require('jsonwebtoken');

// Protects admin-only routes (create/update/delete).
// Public GET routes never use this middleware.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token yaroqsiz yoki muddati tugagan.' });
  }
}

module.exports = requireAuth;
