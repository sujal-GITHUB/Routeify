const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  
    // If no token is provided
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const isBlackListed = await userModel.findOne({token: token})
    if(isBlackListed){
        return res.status(401).json({ message: 'Unauthorized: Invalid Token' });
    }
  
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded._id);
  
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }
  
      req.user = user;
      return next();
    } catch (error) {
      console.error('Error during authentication:', error);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token expired' });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  