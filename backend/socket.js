const { Server } = require("socket.io");
const mongoose = require("mongoose");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const rideModel = require('./models/ride.model');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log('New socket connection:', socket.id);

        socket.on("join", async (data) => {
            try {
                const { userId, userType } = data;

                if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                    console.error(`Invalid userId: ${userId}`);
                    return socket.emit("error", { message: "Invalid userId" });
                }

                console.log(`${userType} Joined : ${userId}`);

                if (userType === "user") {
                    const updatedUser = await userModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id },
                        { new: true }
                    );
                    if (!updatedUser) {
                        return socket.emit("error", { message: "User not found" });
                    }
                    console.log(`User ${userId} socket updated to ${socket.id}`);
                } else if (userType === "captain") {
                    const updatedCaptain = await captainModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id, status: "active" },
                        { new: true }
                    );
                    if (!updatedCaptain) {
                        return socket.emit("error", { message: "Captain not found" });
                    }
                    console.log(`Captain ${userId} socket updated to ${socket.id}`);
                } else {
                    console.error(`Invalid userType: ${userType}`);
                    return socket.emit("error", { message: "Invalid userType" });
                }

                // Send confirmation back to client
                socket.emit("joined", { userId, socketId: socket.id });

            } catch (error) {
                console.error('Join error:', error);
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
                console.error('Location update error:', error);
                socket.emit("error", { message: "Failed to update location" });
            }
        });

        socket.on('request-ride', async (rideData) => {
            try {
                const { pickup, destination, vehicleType, userId, rideId } = rideData;
                
                if (!pickup || !destination || !vehicleType || !userId || !rideId) {
                    return socket.emit("error", { message: "Missing required ride data" });
                }

                // Find active captains within 5km radius
                const captains = await captainModel.find({
                    status: 'active',
                    vehicleType: vehicleType,
                    socketId: { $exists: true, $ne: null } // Ensure captain has active socket
                });

                if (captains.length === 0) {
                    return socket.emit("no-captains-available");
                }

                console.log(`✅ Active Captains Found: ${captains.length}`);

                // Send ride request to each captain
                for (const captain of captains) {
                    sendMessageToSocketId(captain.socketId, {
                        event: 'new-ride-request',
                        data: { ...rideData, captainId: captain._id }
                    });
                }

            } catch (error) {
                console.error('Request ride error:', error);
                socket.emit('error', { message: 'Failed to find captains' });
            }
        });

        socket.on('accept-ride', async ({ userId, captainId }) => {
            try {
            if (!userId || !captainId) {
                return socket.emit("error", { message: "Missing userId or captainId" });
            }

            // Check if captain is still active
            const captain = await captainModel.findById(captainId);
            if (!captain || captain.status !== 'active') {
                return socket.emit("error", { message: "Captain is not available" });
            }

            // First find the pending ride for this user
            const ride = await rideModel.findOneAndUpdate(
                {
                user: userId,
                status: 'pending' // Add status check
                },
                { 
                $set: { 
                    status: 'accepted',
                    captain: captainId // Add captain assignment
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
                console.error('No pending ride found for user:', userId);
                return socket.emit("error", { message: "No pending ride found" });
            }

            const user = await userModel.findById(userId);
            if (!user || !user.socketId) {
                console.error('User not found or not connected:', userId);
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

            // Send confirmation to captain
            socket.emit('ride-confirm', {
                rideId: ride._id,
                pickup: ride.pickup,
                destination: ride.destination,
                fare: ride.fare
            });

            // Get all active captains except the one who accepted
            const otherCaptains = await captainModel.find({
                _id: { $ne: captainId },
                status: 'active',
                socketId: { $exists: true, $ne: null }
            });

            // Notify other captains
            otherCaptains.forEach(captain => {
                sendMessageToSocketId(captain.socketId, {
                event: 'ride-no-longer-available',
                data: { rideId: ride._id }
                });
            });

            } catch (error) {
            console.error('Ride acceptance error:', error);
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
            
                // Notify captain if ride was assigned
                if (ride.captain && ride.captain.socketId) {
                    sendMessageToSocketId(ride.captain.socketId, {
                        event: 'ride-cancelled',
                        data: { rideId: ride._id }
                    });
                }
            
                // Notify all captains
                sendMessageToAllCaptains(rideId, 'ride-no-longer-available');
            
            } catch (error) {
                console.error('Cancel ride error:', error);
                socket.emit("error", { message: "Failed to cancel ride" });
            }
        });

        socket.on('confirm-ride', async ({ rideId, userId }) => {
            try {
                if (!rideId || !userId) {
                    return socket.emit("error", { message: "Missing rideId or userId" });
                }
            
                const ride = await rideModel.findOneAndUpdate(
                    { _id: rideId, user: userId },
                    { 
                        status: 'confirmed',
                        confirmedAt: new Date()
                    },
                    { new: true }
                )
                .populate({
                    path: 'captain',
                    select: 'socketId fullname vehicle rating location'
                })
                .select('+otp'); 

                if (!ride) {
                    return socket.emit("error", { message: "Ride not found" });
                }

                if (ride.captain?.socketId) {
                    sendMessageToSocketId(ride.captain.socketId, {
                        event: 'ride-confirmed',
                        data: {
                            rideId: ride._id,
                            pickup: ride.pickup,
                            destination: ride.destination,
                            fare: ride.fare,
                            otp: ride.otp
                        }
                    });
                }

                // Send success to user
                socket.emit('ride-confirmation-success', {
                    message: 'Ride confirmed successfully'
                });

            } catch (error) {
                console.error('Ride confirmation error:', error);
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
                console.error('Ride completion error:', error);
                socket.emit("error", { message: "Failed to complete ride" });
            }
        });

        socket.on("disconnect", async () => {
            try {
                // Find and update captain
                const captain = await captainModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { status: "inactive", socketId: null },
                    { new: true }
                );

                // Also update user if needed
                const user = await userModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { socketId: null },
                    { new: true }
                );

            } catch (error) {
                console.error("❌ Error handling disconnect:", error);
            }
        });
    });
};

function sendMessageToSocketId(socketId, messageObject) {
    try {
        if (!io.sockets.sockets.has(socketId)) {
            console.error(`Socket ${socketId} not found`);
            return false;
        }
        io.to(socketId).emit(messageObject.event, messageObject.data);
        console.log(`Event ${messageObject.event} sent to ${socketId}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending message via socket:", error);
        return false;
    }
}

function sendMessageToAllCaptains(rideId, event) {
    try {
        io.emit(event, { rideId });
        console.log(`Broadcast ${event} for ride ${rideId}`);
    } catch (error) {
        console.error(`❌ Error broadcasting ${event}:`, error);
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };