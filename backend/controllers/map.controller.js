const mapsService = require('../services/maps.service');
const {validationResult} = require('express-validator');

const getCoordinates = async (req, res) => {
    try {
        const { address } = req.query;
        const coordinates = await mapsService.getAddressCoordinate(address);
        res.status(200).json(coordinates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDistanceTime = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {origin, destination} = req.query;
        const distanceTime = await mapsService.getDistanceTime(origin, destination);
        res.status(200).json(distanceTime);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const { address } = req.query;
        const suggestions = await mapsService.getSuggestions(address);
        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getCoordinates,
    getDistanceTime,
    getSuggestions
};
