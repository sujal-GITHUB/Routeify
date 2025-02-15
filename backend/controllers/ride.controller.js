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

    const { userId, pickup, destination, vehicleType } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });
        

        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        console.log(pickupCoordinates);
        
        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.latitude, pickupCoordinates.longitude, 5);
        if (captainsInRadius.length === 0) {
            console.log('No captains found in the vicinity.');
        } else {
            console.log(captainsInRadius);
        }

        return res.status(201).json(ride);
    } catch (err) {
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