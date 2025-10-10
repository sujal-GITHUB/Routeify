const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto')

async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    let distanceTime;
    
    // Check if pickup and destination have coordinates (from Search Box API)
    const pickupHasCoords = pickup && typeof pickup === 'object' && pickup.latitude && pickup.longitude;
    const destinationHasCoords = destination && typeof destination === 'object' && destination.latitude && destination.longitude;
    
    if (pickupHasCoords && destinationHasCoords) {
        // Use coordinate-based distance calculation
        distanceTime = await mapService.getDistanceTimeFromCoords(
            pickup.latitude, pickup.longitude,
            destination.latitude, destination.longitude
        );
    } else {
        // Fallback to address-based calculation
        const pickupAddress = typeof pickup === 'string' ? pickup : pickup?.formatted_address || '';
        const destinationAddress = typeof destination === 'string' ? destination : destination?.formatted_address || '';
        
        distanceTime = await mapService.getDistanceTime(pickupAddress, destinationAddress);
    }
    
    if (!distanceTime || !distanceTime.distance || !distanceTime.duration) {
        throw new Error('Error occurred while fetching distance and duration');
    }

    const distanceInKm = parseFloat(distanceTime.distance.replace(/[^\d.]/g, ""));
    const durationParts = distanceTime.duration.match(/(\d+) hour[s]? (\d+) min[s]?/);
    let durationInMin = 0;

    if (durationParts) {
        durationInMin = parseInt(durationParts[1]) * 60 + parseInt(durationParts[2]);
    } else {
        durationInMin = parseInt(distanceTime.duration.replace(/[^\d]/g, ""));
    }

    if (isNaN(distanceInKm) || isNaN(durationInMin)) {
        throw new Error('Invalid distance or duration data');
    }

    const baseFare = { auto: 30, car: 50, motorcycle: 20 };
    const perKmRate = { auto: 3, car: 5, motorcycle: 2 };
    const perMinuteRate = { auto: 0.5, car: 1, motorcycle: 0.3 };

    return {
        auto: Math.round(baseFare.auto + distanceInKm * perKmRate.auto + durationInMin * perMinuteRate.auto),
        car: Math.round(baseFare.car + distanceInKm * perKmRate.car + durationInMin * perMinuteRate.car),
        motorcycle: Math.round(baseFare.motorcycle + distanceInKm * perKmRate.motorcycle + durationInMin * perMinuteRate.motorcycle),
    };
}

module.exports.getFare = getFare

async function getOtp(num){
    const otp = crypto.randomInt(Math.pow(10, num-1), Math.pow(10, num)).toString()
    return otp
}

module.exports.createRide = async ({ user, pickup, destination, vehicleType, pickupCoordinates, destinationCoordinates }) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error("All fields are required, including captain");
    }

    const otp = await getOtp(6)
    
    // Use coordinates for fare calculation if available, otherwise use addresses
    let fare;
    if (pickupCoordinates && destinationCoordinates) {
        fare = await getFare(pickupCoordinates, destinationCoordinates);
    } else {
        fare = await getFare(pickup, destination);
    }
    
    if (isNaN(fare[vehicleType])) {
        throw new Error("Invalid fare calculation");
    }

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp: otp,
        fare: fare[vehicleType],
    });

    return ride;
};