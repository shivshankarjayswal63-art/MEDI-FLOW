/** Require JWT role (use after authMiddleware). */
function requireRole(...allowedRoles) {
  const allowed = new Set(allowedRoles);
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowed.has(role)) {
      return res.status(403).json({
        message: "Access denied. Your account cannot use this portal.",
        role,
      });
    }
    next();
  };
}

function requireSelfOrRole(paramName = "id", ...adminRoles) {
  const admins = new Set(adminRoles);
  return (req, res, next) => {
    const role = req.user?.role;
    const userId = req.user?.id;
    const targetId = req.params[paramName];
    if (!role || !userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (String(userId) === String(targetId) || admins.has(role)) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  };
}

module.exports = { requireRole, requireSelfOrRole };
