const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
    },
    pickup: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    fare: {
        type: Number,
        required: true,
        min: [0, 'Fare must be a positive number'],
        validate: {
            validator: function(value) {
                return Number.isFinite(value) && value >= 0;
            },
            message: 'Fare must be a valid positive number'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted','confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    duration: {
        type: Number
    }, // minutes
    distance: {
        type: Number
    }, // meters
    paymentId: {
        type: String,
    },
    orderId: {
        type: String
    },
    signature: {
        type: String
    },
    otp:{
        type: Number,
        select: false,
        required: true,
        validate: {
            validator: function(value) {
                return Number.isInteger(value) && value >= 100000 && value <= 999999;
            },
            message: 'OTP must be a 6-digit number'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    cancelledAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

// Pre-save middleware to update updatedAt field
rideSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Pre-update middleware to update updatedAt field
rideSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model('Ride', rideSchema);
