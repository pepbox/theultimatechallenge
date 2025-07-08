const jwt = require('jsonwebtoken');
const Admin = require('../../admin/models/adminSchema');
const TheUltimateChallenge = require('../../../theUltimateChallenge/models/TheUltimateChallenge');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const loginAdmin = async (req, res) => {
  try {
    const { sessionId, passCode } = req.body;


    // Validate input
    if (!sessionId || !passCode) {
      return res.status(400).json({
        success: false,
        error: 'Please provide sessionId and passCode'
      });
    }

    // Validate passCode format (should be 4 digits)
    if (!/^\d{4}$/.test(passCode)) {
      return res.status(400).json({
        success: false,
        error: 'PassCode must be exactly 4 digits'
      });
    }

    // Verify the session exists first
    const session = await TheUltimateChallenge.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    if (session.sessionEnded) {
      return res.status(400).json({
        success: false,
        error: 'Session has already ended'
      });
    }

    // Find the admin by session ID and passCode
    const admin = await Admin.findOne({
      session: sessionId,
      passCode: passCode
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials - wrong passcode'
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

    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID format'
      });
    }

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

// Additional helper function to validate admin session
const validateAdminSession = async (req, res) => {
  try {
    // Get JWT token from cookie
    const token = req.cookies.adminToken;

    const { sessionId: adminSessionId } = req.query;


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


    // Find admin and session
    const admin = await Admin.findById(decoded.adminId);
    const session = await TheUltimateChallenge.findById(adminSessionId);



    if (!admin || !session) {
      return res.status(404).json({
        success: false,
        error: 'Admin or session not found'
      });
    }

    if (admin.session.toString() !== session._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Admin does not belong to this session'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        adminName: admin.adminName,
        sessionId: session._id,
        companyName: session.companyName,
        isValid: true
      },
      message: 'Admin session is valid'
    });

  } catch (error) {
    console.error('Error in validating admin session:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const restoreCookie = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.adminId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }


    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    };

    // Set the JWT as HTTP-only cookie
    res.cookie('adminToken', token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Cookie restored successfully',
      sessionId: admin.session,
    });
  }
  catch (error) {
    console.error('Error restoring cookie:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore cookie',
      error: error.message
    });
  }
}

module.exports = {
  loginAdmin,
  logoutAdmin,
  updateSocketId,
  validateAdminSession,
  restoreCookie
};