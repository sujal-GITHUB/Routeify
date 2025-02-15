const userModel = require('../models/user.model')
const userService = require('../services/user.service')
const {validationResult} = require('express-validator')
const blacklistToken = require('../models/blacklistToken.model')

  module.exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
  
    // Validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { fullname, email, password } = req.body;
  
    try {
      // Check if user already exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }
  
      // Hash the password
      const hashedPassword = await userModel.hashPassword(password);
  
      // Create the user
      const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
      });
  
      // Generate authentication token
      const token = user.generateAuthToken();
  
      // Send successful response
      res.status(201).json({ token, user });
    } catch (error) {
      console.error("Error in registerUser:", error);
  
      // Handle specific error types if needed
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: "Validation error", details: error.message });
      }
  
      // Generic error response
      res.status(500).json({ message: "An error occurred during user registration" });
    }
  };  

  module.exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
  
    // Validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
  
    try {
      // Find user by email and include password for comparison
      const user = await userModel.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
      }
  
      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
      }
  
      const token = user.generateAuthToken();
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        maxAge: 3600000
      })

      res.status(200).json({ token, user });
    } catch (error) {
      console.error("Error in loginUser:", error);
  
      // Generic error response
      res.status(500).json({ message: 'An error occurred during login' });
    }
  };  

  module.exports.getUserProfile = async (req,res,next)=>{
    res.status(200).json(req.user)
  }

  module.exports.logoutUser = async (req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization.split(' ')[1]
    await blacklistToken.create({token})

    res.clearCookie('token')
    res.status(200).json({message: 'Logged out'})
  }

  module.exports.makePaymentRequest = makePaymentRequest = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
