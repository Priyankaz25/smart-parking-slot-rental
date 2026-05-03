const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth?.role || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Insufficient role permissions" });
    }
    return next();
  };
}

function requireOwnerParamAccess(paramKey = "ownerId") {
  return (req, res, next) => {
    if (req.auth?.role === "admin") {
      return next();
    }
    if (String(req.auth?.id) !== String(req.params[paramKey])) {
      return res.status(403).json({ error: "Owner can only access own resources" });
    }
    return next();
  };
}

module.exports = {
  authenticate,
  requireRole,
  requireOwnerParamAccess,
};
