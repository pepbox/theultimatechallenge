const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/superAdminSchema'); // Assuming the schema is in superAdminModel.js

const superAdminAuthMiddleware = async (req, res, next) => {
  try {
    // Get the token from the cookie named 'token'
    const superAdminToken = req.cookies.token;

    if (!superAdminToken) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify the token
    const decoded = jwt.verify(superAdminToken, process.env.JWT_SECRET || 'your_jwt_secret');

    // Find the super admin by ID from the decoded token
    const superAdmin = await SuperAdmin.findById(decoded.id).select('-password');
    if (!superAdmin) {
      return res.status(401).json({ message: 'Super admin not found, authorization denied' });
    }

    // Attach super admin data to the request object
    req.superAdmin = {
      id: superAdmin._id,
      email: superAdmin.email
    };

    next();
  } catch (error) {
    console.error('Error in superAdminAuthMiddleware:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {superAdminAuthMiddleware};