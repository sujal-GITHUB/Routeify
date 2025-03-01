const captainModel = require('../models/captain.model')
const captainService = require('../services/captain.service')
const {validationResult} = require('express-validator')
const blacklistToken = require('../models/blacklistToken.model')

// Helper function
const resetHoursOnlineAtMidnight = async () => {
    try {
        const result = await captainModel.updateMany(
            {}, 
            { $set: { hoursOnline: 0 } }
        );
        console.log(`Reset hoursOnline for ${result.modifiedCount} captains at midnight`);
    } catch (error) {
        console.error('Error resetting hoursOnline:', error);
    }
};

const registerCaptain = async (req, res) => {
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
            rating: 0
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

const loginCaptain = async (req, res) => {
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

const getCaptainProfile = async(req,res) => {
    res.status(200).json({captain: req.captain})
};

const logoutCaptain = async (req,res) => {
    const token = req.cookies.token || req.headers.authorization.split(' ')[1]
    await blacklistToken.create({token})

    res.clearCookie('token')
    res.status(200).json({message: 'Logged out'})
};

const updateCaptainProfile = async (req, res) => {
    const { firstname, lastname, email, vehicle, status, rating, hoursOnline } = req.body;

    try {   
        // Check if the captain exists
        const captain = await captainModel.findById(req.captain._id);
        if (!captain) {
            return res.status(404).json({ message: 'Captain not found.' });
        }

        // Update captain profile data if provided
        if (firstname) captain.firstname = firstname;
        if (lastname) captain.lastname = lastname;
        if (email) captain.email = email;
        if (rating) captain.rating = rating;
        if (status) captain.status = status;
        if (hoursOnline) captain.hoursOnline = hoursOnline;

        // Update vehicle information if provided
        if (vehicle) {
            if (vehicle.color) captain.vehicle.color = vehicle.color;
            if (vehicle.plate) captain.vehicle.plate = vehicle.plate;
            if (vehicle.capacity) captain.vehicle.capacity = vehicle.capacity;
            if (vehicle.vehicleType) captain.vehicle.vehicleType = vehicle.vehicleType;
        }

        // Save the updated captain data
        try {
            await captain.save();
        } catch (dbError) {
            console.error("Error saving captain profile:", dbError);
            return res.status(500).json({ message: "Error saving profile to database." });
        }

        // Fetch the updated captain profile
        const updatedCaptainProfile = await captainModel.findById(req.captain._id);

        // Respond with the updated captain info
        res.status(200).json({ message: 'Profile updated successfully.', captain: updatedCaptainProfile });
    } catch (error) {
        console.error("Error in updateCaptainProfile:", error); // Log the entire error object
        res.status(500).json({ message: "An internal server error occurred. Please try again later." });
    }
};

// Export all functions together
module.exports = {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain,
    updateCaptainProfile,
    resetHoursOnlineAtMidnight
};

