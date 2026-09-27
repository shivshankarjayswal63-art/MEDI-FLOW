const jwt = require("jsonwebtoken");

/** Sets req.user when Bearer token is valid; continues without user otherwise. */
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token || !process.env.JWT_SECRET) {
    return next();
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = optionalAuthMiddleware;
