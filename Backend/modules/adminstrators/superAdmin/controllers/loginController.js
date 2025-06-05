const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/superAdminSchema")

// Login controller for SuperAdmin
const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find super admin by email
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: superAdmin._id, email: superAdmin.email },
      process.env.JWT_SECRET || "your_jwt_secret_key", // Use environment variable for secret
      { expiresIn: "1d" } // Token expires in 1 day
    );

    // Set token in a secure cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Mitigates CSRF attacks
      maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 1 day (in milliseconds)
    });

    // Send success response
    return res.status(200).json({
      message: "Login successful",
      superAdmin: {
        id: superAdmin._id,
        email: superAdmin.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};


const createSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    
    const existingAdmin = await SuperAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'SuperAdmin with this email already exists.' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newAdmin = new SuperAdmin({
      email,
      password: hashedPassword
    });

    await newAdmin.save();

    res.status(201).json({ message: 'SuperAdmin created successfully.' });
  } catch (error) {
    console.error('Error creating SuperAdmin:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



module.exports={loginSuperAdmin,createSuperAdmin};