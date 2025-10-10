const { Server } = require("socket.io");
const mongoose = require("mongoose");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const rideModel = require('./models/ride.model');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:4173", "https://routeify.onrender.com", "https://routeify.live"],
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        pingTimeout: 60000,
        pingInterval: 25000
    });
    
    io.on("connection", (socket) => {

        socket.on("join", async (data) => {
            try {
                const { userId, userType } = data;

                if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                    return socket.emit("error", { message: "Invalid userId" });
                }

                if (userType === "user") {
                    const updatedUser = await userModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id },
                        { new: true }
                    );
                    if (!updatedUser) {
                        return socket.emit("error", { message: "User not found" });
                    }
                } else if (userType === "captain") {
                    const updatedCaptain = await captainModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id, status: "active" },
                        { new: true }
                    );
                    if (!updatedCaptain) {
                        return socket.emit("error", { message: "Captain not found" });
                    }
                } else {
                    return socket.emit("error", { message: "Invalid userType" });
                }

                // Send confirmation back to client
                socket.emit("joined", { userId, socketId: socket.id });

            } catch (error) {
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("update-location-captain", async (data) => {
            try {
                const { userId, location } = data;

                if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                    return socket.emit("error", { message: "Invalid userId" });
                }

                if (!location || typeof location.latitude !== "number" || typeof location.longitude !== "number") {
                    return socket.emit("error", { message: "Invalid location data" });
                }

                const updatedCaptain = await captainModel.findByIdAndUpdate(
                    userId,
                    {
                        location: {
                            type: "Point",
                            coordinates: [location.longitude, location.latitude]
                        }
                    },
                    { new: true }
                );

                if (!updatedCaptain) {
                    return socket.emit("error", { message: "Captain not found" });
                }

                socket.emit("location-updated", {
                    userId,
                    location: updatedCaptain.location
                });

            } catch (error) {
                socket.emit("error", { message: "Failed to update location" });
            }
        });

        socket.on('request-ride', async (rideData) => {
            try {
                const { pickup, destination, vehicleType, userId, rideId } = rideData;

                if (!pickup || !destination || !vehicleType || !userId || !rideId) {
                    return socket.emit("error", { message: "Missing required ride data" });
                }

                // Get the complete ride data from database
                const ride = await rideModel.findById(rideId)
                    .populate('user', 'fullname')
                    .select('pickup destination fare vehicleType');

                if (!ride) {
                    return socket.emit("error", { message: "Ride not found" });
                }

                const captains = await captainModel.find({
                    status: 'active',
                    vehicleType: vehicleType,
                    socketId: { $exists: true, $ne: null }
                });

                if (captains.length === 0) {
                    return socket.emit("no-captains-available");
                }

                for (const captain of captains) {
                    sendMessageToSocketId(captain.socketId, {
                        event: 'new-ride-request',
                        data: { 
                            ride: {
                                _id: ride._id,
                                pickup: ride.pickup,
                                destination: ride.destination,
                                fare: ride.fare,
                                vehicleType: ride.vehicleType,
                                user: ride.user
                            },
                            captainId: captain._id 
                        }
                    });
                }

            } catch (error) {
                socket.emit('error', { message: 'Failed to find captains' });
            }
        });

        socket.on('accept-ride', async ({ userId, captainId, rideId }) => {
            try {
            if (!userId || !captainId || !rideId) {
                return socket.emit("error", { message: "Missing userId or captainId" });
            }
            const captain = await captainModel.findById(captainId);
            if (!captain || captain.status !== 'active') {
                return socket.emit("error", { message: "Captain is not available" });
            }

            const ride = await rideModel.findOneAndUpdate(
                {
                _id: rideId,
                user: userId,
                },
                { 
                $set: { 
                    status: 'accepted',
                    captain: captainId 
                } 
                },
                { 
                new: true,
                runValidators: true
                }
            )
            .populate({
                path: 'user',
                select: 'fullname socketId'
            })
            .populate({
                path: 'captain',
                select: 'fullname vehicle rating socketId location'
            })
            .select('+otp');

            if (!ride) {
                return socket.emit("error", { message: "No pending ride found" });
            }

            const user = await userModel.findById(userId);
            if (!user || !user.socketId) {
                return socket.emit("error", { message: "User not connected" });
            }

            // Send ride accepted event to user
            sendMessageToSocketId(user.socketId, {
                event: 'ride-accepted',
                data: {
                captain: ride.captain,
                rideId: ride._id,
                status: 'accepted',
                otp: ride.otp
                }
            });

            socket.emit('ride-confirm', {
                rideId: ride._id,
                pickup: ride.pickup,
                destination: ride.destination,
                fare: ride.fare
            });

            const otherCaptains = await captainModel.find({
                _id: { $ne: captainId },
                status: 'active',
                socketId: { $exists: true, $ne: null }
            });

            otherCaptains.forEach(captain => {
                sendMessageToSocketId(captain.socketId, {
                event: 'ride-no-longer-available',
                data: { rideId: ride._id }
                });
            });

            } catch (error) {
                socket.emit("error", { message: "Failed to accept ride" });
            }
        });

        socket.on('cancel-ride', async ({ rideId, userId }) => {
            try {
                if (!rideId) {
                    return socket.emit("error", { message: "Missing rideId" });
                }
            
                const ride = await rideModel.findOneAndUpdate(
                    { _id: rideId },
                    { 
                        status: 'cancelled',
                        cancelledAt: new Date(),
                        cancelledBy: userId
                    },
                    { new: true }
                ).populate('captain');
            
                if (!ride) {
                    return socket.emit("error", { message: "Ride not found" });
                }

                if (ride.captain && ride.captain.socketId) {
                    sendMessageToSocketId(ride.captain.socketId, {
                        event: 'ride-cancelled',
                        data: { rideId: ride._id }
                    });
                }

                sendMessageToAllCaptains(rideId, 'ride-no-longer-available');
            
            } catch (error) {
                socket.emit("error", { message: "Failed to cancel ride" });
            }
        });

        socket.on('confirm-ride', async ({ rideId, userId }) => {
            try {
                if (!rideId || !userId) {
                    return socket.emit("error", { message: "Missing rideId or userId" });
                }

                const ride = await rideModel.findOneAndUpdate(
                    { 
                        _id: rideId, 
                        user: userId,
                        status: "accepted"
                    },
                    { 
                        $set: { 
                            status: 'confirmed',
                        } 
                    },
                    { 
                        new: true,
                        runValidators: true 
                    }
                )
                .populate({
                    path: 'captain',
                    select: 'socketId fullname vehicle rating location'
                })
                .select('+otp');
                if (!ride) {
                    return socket.emit("error", { message: "Ride not found or cannot be confirmed" });
                }

                if (!ride.captain) {
                    // If captain not populated, try to find the ride again
                    const fullRide = await rideModel.findById(rideId)
                        .populate('captain')
                        .select('+otp');

                    if (!fullRide.captain) {
                        return socket.emit("error", { message: "Captain not found" });
                    }

                    ride.captain = fullRide.captain;
                }

                // Send confirmation to captain
                const messageSent = sendMessageToSocketId(ride.captain.socketId, {
                    event: 'ride-confirmed',
                    data: {
                        rideId: ride._id,
                        pickup: ride.pickup,
                        destination: ride.destination,
                        fare: ride.fare,
                        otp: ride.otp,
                        status: 'confirmed'
                    }
                });

                if (!messageSent) {
                    return socket.emit("error", { message: "Could not notify captain" });
                }

                // Send success to user
                socket.emit('ride-confirmation-success', {
                    message: 'Ride confirmed successfully',
                    rideId: ride._id
                });

            } catch (error) {
                socket.emit("error", { message: "Failed to confirm ride" });
            }
        });

        socket.on('ride-completed', async ({ rideId, captainId, otp }) => {
            try {
                if (!rideId || !captainId || !otp) {
                    return socket.emit("error", { message: "Missing required data" });
                }
        
                const ride = await rideModel.findOneAndUpdate(
                    { 
                        _id: rideId,
                        captain: captainId,
                        otp: otp,
                        status: 'confirmed'
                    },
                    { 
                        status: 'completed',
                        completedAt: new Date()
                    },
                    { new: true }
                ).populate('user');
        
                if (!ride) {
                    return socket.emit("error", { message: "Ride not found or invalid OTP" });
                }
        
                // Notify user that ride is completed
                if (ride.user?.socketId) {
                    sendMessageToSocketId(ride.user.socketId, {
                        event: 'ride-completed',
                        data: {
                            rideId: ride._id,
                            fare: ride.fare,
                            pickup: ride.pickup,
                            destination: ride.destination
                        }
                    });
                }
        
                // Send confirmation to captain
                socket.emit('ride-completion-success', {
                    message: 'Ride completed successfully'
                });
        
            } catch (error) {
                socket.emit("error", { message: "Failed to complete ride" });
            }
        });
    
        socket.on("disconnect", async () => {
            try {
                await Promise.all([
                    captainModel.findOneAndUpdate(
                        { socketId: socket.id },
                        { status: "inactive", socketId: null }
                    ),
                    userModel.findOneAndUpdate(
                        { socketId: socket.id },
                        { socketId: null }
                    )
                ]);
            } catch (error) {
                // Silent cleanup
            }
        });

        socket.on("user-rating", async ({ rideId, rating, captainId }) => {
            try {
                // Validate input data
                if (!rideId || !captainId || typeof rating !== "number") {
                    return socket.emit("error", { message: "Invalid rating data provided" });
                }

                // Validate rating range
                if (rating < 1 || rating > 5) {
                    return socket.emit("error", { message: "Rating must be between 1 and 5" });
                }

                const captain = await captainModel.findById(captainId);
                if (captain && captain.socketId) {
                    io.to(captain.socketId).emit("user-rating", { rideId, rating });
                } else {
                    return socket.emit("error", { message: "Captain not found or not connected" });
                }
            } catch (error) {
                socket.emit("error", { message: "Failed to process rating" });
            }
        });
    });
};

function sendMessageToSocketId(socketId, messageObject) {
    try {
        if (!io.sockets.sockets.has(socketId)) {
            return false;
        }
        
        io.to(socketId).emit(messageObject.event, messageObject.data);
        return true;
    } catch (error) {
        return false;
    }
}

function sendMessageToAllCaptains(rideId, event) {
    try {
        io.emit(event, { rideId });
    } catch (error) {
        // Silent error handling
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };