const jwt = require('jsonwebtoken');
const Admin = require('../../admin/models/adminSchema');
const TheUltimateChallenge = require('../../../theUltimateChallenge/models/TheUltimateChallenge');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const loginAdmin = async (req, res) => {
  try {
    const { adminName, sessionId, passCode } = req.body;

    // Validate input
    if (!adminName || !sessionId || !passCode) {
      return res.status(400).json({
        success: false,
        error: 'Please provide adminName, sessionId, and passCode'
      });
    }

    // Find the admin by adminName and session ID
    const admin = await Admin.findOne({ 
      adminName,
      session: sessionId 
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials - admin not found'
      });
    }

    // Verify passCode
    if (admin.passCode !== passCode) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials - wrong passCode'
      });
    }

    // Verify the session exists
    const session = await TheUltimateChallenge.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Create JWT token payload
    const tokenPayload = {
      adminId: admin._id,
      sessionId: session._id,
      adminName: admin.adminName
    };

    // Generate JWT token
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    };

    // Set the JWT as HTTP-only cookie
    res.cookie('adminToken', token, cookieOptions);

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        adminName: admin.adminName,
        sessionId: session._id,
        companyName: session.companyName
      },
      message: 'Admin logged in successfully'
    });

  } catch (error) {
    console.error('Error in admin login:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const logoutAdmin = (req, res) => {
  try {
    // Clear the adminToken cookie
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({
      success: true,
      message: 'Admin logged out successfully'
    });
  } catch (error) {
    console.error('Error in admin logout:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const updateSocketId = async (req, res) => {
  try {
    const { socketId } = req.body;

    // Validate socketId
    if (!socketId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide socketId'
      });
    }

    // Get JWT token from cookie
    const token = req.cookies.adminToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Find and update admin with socketId
    const admin = await Admin.findByIdAndUpdate(
      decoded.adminId,
      { socketId },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Socket ID updated successfully',
      data: {
        adminName: admin.adminName,
        sessionId: admin.session,
        socketId: admin.socketId
      }
    });

  } catch (error) {
    console.error('Error in updating socket ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  loginAdmin,
  logoutAdmin,
  updateSocketId
};