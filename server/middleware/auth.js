const jwt = require('jsonwebtoken');

/**
 * requireAuth — verifies JWT Bearer token.
 * Attaches decoded payload to req.user.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * checkRole — role-based access control.
 * 'admin' can do everything. 'staff' access only staff-level routes.
 */
function checkRole(requiredRole) {
  return (req, res, next) => {
    if (req.user.role === 'admin') return next();
    if (requiredRole === 'staff') return next();
    return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
  };
}

module.exports = { requireAuth, checkRole };
