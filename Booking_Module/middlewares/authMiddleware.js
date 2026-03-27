const jwt = require('jsonwebtoken');
require('dotenv').config();

//verify JWT
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ error: 'Malformed token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = {
      id:   decoded.userId,
      role: decoded.role
    };
    next();
  });
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ error: 'Not authenticated' });

  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: 'Not authourized to perform this action!' });

  next();
};

module.exports = { verifyJWT, requireRole };