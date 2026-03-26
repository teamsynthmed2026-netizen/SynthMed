// auth.js - JWT Authentication Middleware
// Protects routes that require a logged-in user
const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please login.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '

  try {
    // Verify token with our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request object
    next(); // Continue to the route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
  }
};

module.exports = { protect };
