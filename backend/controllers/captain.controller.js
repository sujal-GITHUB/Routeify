const captainModel = require('../models/captain.model')
const captainService = require('../services/captain.service')
const {validationResult} = require('express-validator')

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
