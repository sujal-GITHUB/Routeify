const rideService = require('../services/ride.service');
const mapService = require('../services/maps.service')
const { validationResult } = require('express-validator');
const {sendMessageToSocketId} = require('../socket')
const captainModel = require('../models/captain.model')

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType, pickupCoordinates, destinationCoordinates } = req.body;

    try {
        // Use provided coordinates if available, otherwise geocode the address
        let finalPickupCoordinates;
        if (pickupCoordinates && pickupCoordinates.latitude && pickupCoordinates.longitude) {
            finalPickupCoordinates = pickupCoordinates;
        } else {
            finalPickupCoordinates = await mapService.getAddressCoordinate(pickup);
        }
        
        if (!finalPickupCoordinates || finalPickupCoordinates.latitude === undefined || finalPickupCoordinates.longitude === undefined) {
            return res.status(400).json({ message: "Invalid pickup coordinates." });
        }

        // Use provided destination coordinates if available, otherwise geocode the address
        let finalDestinationCoordinates;
        if (destinationCoordinates && destinationCoordinates.latitude && destinationCoordinates.longitude) {
            finalDestinationCoordinates = destinationCoordinates;
        } else {
            finalDestinationCoordinates = await mapService.getAddressCoordinate(destination);
        }
        
        if (!finalDestinationCoordinates || finalDestinationCoordinates.latitude === undefined || finalDestinationCoordinates.longitude === undefined) {
            return res.status(400).json({ message: "Invalid destination coordinates." });
        }

        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            finalPickupCoordinates.latitude, 
            finalPickupCoordinates.longitude, 
            7
        );

        if (!captainsInRadius || captainsInRadius.length === 0) {
            return res.status(404).json({ message: "No captains available nearby." });
        }

        // Filter captains by active status
        const activeCaptains = captainsInRadius.filter(captain => captain.status === "active");

        if (activeCaptains.length === 0) {
            return res.status(404).json({ message: "No active captains available." });
        }

        const ride = await rideService.createRide({ 
            user: req.user._id, 
            pickup, 
            destination, 
            vehicleType,
            pickupCoordinates: finalPickupCoordinates,
            destinationCoordinates: finalDestinationCoordinates
        });

        ride.otp = ""
        
        for (const captain of activeCaptains) {
            // Get the most recent captain data to ensure we have the latest socketId
            const recentCaptain = await captainModel.findById(captain._id);
            if (!recentCaptain || !recentCaptain.socketId) {
                continue;
            }
            
            const success = sendMessageToSocketId(recentCaptain.socketId, {
                event: 'new-ride-request',
                data: {
                    ride: ride,
                    pickupCoordinates: finalPickupCoordinates,
                    destinationCoordinates: finalDestinationCoordinates
                }
            });
            
        }

        return res.status(201).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {
    const { pickup, destination, pickupLat, pickupLng, destLat, destLng } = req.query;

    try {
        let fare;
        
        // Check if coordinates are provided
        if (pickupLat && pickupLng && destLat && destLng) {
            // Create coordinate objects for the service
            const pickupObj = {
                latitude: parseFloat(pickupLat),
                longitude: parseFloat(pickupLng)
            };
            const destinationObj = {
                latitude: parseFloat(destLat),
                longitude: parseFloat(destLng)
            };
            
            fare = await rideService.getFare(pickupObj, destinationObj);
        } else {
            fare = await rideService.getFare(pickup, destination);
        }
        
        return res.status(200).json(fare);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};