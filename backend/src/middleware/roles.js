export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({ message: `Forbidden: this needs a ${roles.join(' or ')} account (you are logged in as ${req.user?.role || 'unknown'})` });