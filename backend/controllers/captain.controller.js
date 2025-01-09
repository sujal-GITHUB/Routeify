const captainModel = require('../models/captain.model')
const captainService = require('../services/captain.service')
const {validationResult} = require('express-validator')
const blacklistToken = require('../models/blacklistToken.model')

module.exports.registerCaptain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation errors:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password, vehicle } = req.body;

        // Validate required fields
        if (!fullname || !email || !password || !vehicle) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const hashedPassword = await captainModel.hashPassword(password);

        // Check if captain already exists
        const isCaptainAlreadyExists = await captainModel.findOne({ email });
        if (isCaptainAlreadyExists) {
            return res.status(400).json({ message: "Captain already exists." });
        }

        // Validate vehicle structure
        const { color, plate, capacity, vehicleType } = vehicle;
        if (!color || !plate || !capacity || !vehicleType) {
            return res.status(400).json({ message: "Vehicle details are incomplete." });
        }

        // Create captain
        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword,
            vehicle: {
                color,
                plate,
                capacity,
                vehicleType,
            },
        });

        // Generate auth token
        const token = captain.generateAuthToken();
        res.status(201).json({ token, captain });

    } catch (error) {
        console.error("Error in registerCaptain:", error.message || error);

        // Handle specific errors, if possible
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Invalid data provided.", details: error.message });
        }

        // General error handling
        res.status(500).json({ message: "An internal server error occurred. Please try again later." });
    }
};

module.exports.loginCaptain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if the captain exists
        const captain = await captainModel.findOne({ email }).select('+password');
        if (!captain) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }

        // Compare password
        const isMatch = await captain.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }

        // Generate auth token
        const token = captain.generateAuthToken();

        // Send the token in a cookie (optionally secure)
        res.cookie('token', token, {
            httpOnly: true, // To prevent access to the cookie via JavaScript
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            sameSite: 'strict', // Ensures the cookie is sent in first-party contexts
        });

        // Respond with the token and captain info
        res.status(200).json({ token, captain });

    } catch (error) {
        console.error("Error in loginCaptain:", error.message || error);

        // Handle specific errors
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        // General error handling
        res.status(500).json({ message: "An internal server error occurred. Please try again later." });
    }
};

module.exports.getCaptainProfile = async(req,res) =>{
    res.status(200).json({captain: req.captain})
}

module.exports.logoutCaptain = async (req,res) =>{
    const token = req.cookies.token || req.headers.authorization.split(' ')[1]
    await blacklistToken.create({token})

    res.clearCookie('token')
    res.status(200).json({message: 'Logged out'})
}