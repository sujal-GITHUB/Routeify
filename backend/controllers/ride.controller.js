/* This code snippet is a part of a Node.js application that handles ride-related functionalities.
Here's a breakdown of what the code does: */
const rideService = require('../services/ride.service');
const mapService = require('../services/maps.service')
const { validationResult } = require('express-validator');

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        if (!pickupCoordinates || pickupCoordinates.latitude === undefined || pickupCoordinates.longitude === undefined) {
            return res.status(400).json({ message: "Invalid pickup coordinates." });
        }

        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.latitude, 
            pickupCoordinates.longitude, 
            7
        );

        if (!captainsInRadius || captainsInRadius.length === 0) {
            console.log("⚠️ No captains found in the vicinity.");
            return res.status(404).json({ message: "No captains available nearby." });
        }

        // Filter captains by active status
        const activeCaptains = captainsInRadius.filter(captain => captain.status === "active");

        if (activeCaptains.length === 0) {
            console.log("⚠️ No active captains available.");
            return res.status(404).json({ message: "No active captains available." });
        }

        console.log(`✅ Active Captains Found: ${activeCaptains.length}`);

        const ride = await rideService.createRide({ 
            user: req.user._id, 
            pickup, 
            destination, 
            vehicleType 
        });

        console.log('Ride created successfully!')

        return res.status(201).json(ride);
    } catch (err) {
        console.error("❌ Error in createRide:", err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};