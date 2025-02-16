const { Server } = require("socket.io");
const mongoose = require("mongoose");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

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

        socket.on("join", async (data) => {
            try {
                const { userId, userType } = data;

                if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                    console.error(`Invalid userId: ${userId}`);
                    return socket.emit("error", { message: "Invalid userId" });
                }

                console.log(`${userType} Joined : ${userId}`);

                if (userType === "user") {
                    await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                } else if (userType === "captain") {
                    await captainModel.findByIdAndUpdate(userId, { socketId: socket.id, status: "active" });
                } else {
                    console.error(`Invalid userType: ${userType}`);
                    return socket.emit("error", { message: "Invalid userType" });
                }
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
                            coordinates: [location.longitude, location.latitude] // Correct order
                        }
                    },
                    { new: true } // Ensures we get the latest updated document
                );

                if (!updatedCaptain) {
                    return socket.emit("error", { message: "Captain not found" });
                }

                // Send confirmation back to the captain
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
              // Find active captains within 5km radius
              const captains = await captainModel.find({
                status: 'active',
                vehicleType: rideData.vehicleType,
                location: {
                  $near: {
                    $geometry: {
                      type: "Point",
                      coordinates: [/* user's longitude */, /* user's latitude */]
                    },
                    $maxDistance: 5000 // 5km radius
                  }
                }
              });
          
              // Send ride request to nearby captains
              captains.forEach(captain => {
                sendMessageToSocketId(captain.socketId, {
                  event: 'new-ride-request',
                  data: rideData
                });
              });
            } catch (error) {
              socket.emit('error', { message: 'Failed to find captains' });
            }
          });
          
          socket.on('accept-ride', async ({ rideId, captainId }) => {
            try {
              // Update ride with captain information
              const ride = await rideModel.findByIdAndUpdate(
                rideId,
                { captain: captainId, status: 'accepted' },
                { new: true }
              );
          
              // Get user socket ID from ride
              const user = await userModel.findById(ride.user);
              
              // Notify user
              sendMessageToSocketId(user.socketId, {
                event: 'ride-accepted',
                data: { captain: captainId }
              });
          
              // Notify other captains
              sendMessageToAllCaptains(rideId, 'ride-no-longer-available');
          
            } catch (error) {
              console.error('Ride acceptance error:', error);
            }
          });
          
          socket.on('cancel-ride', (rideId) => {
            // Notify all captains about cancellation
            sendMessageToAllCaptains(rideId, 'ride-cancelled');
          });
          
          function sendMessageToAllCaptains(rideId, event) {
            io.emit(event, { rideId });
          }

        socket.on("disconnect", async () => {

            try {
                // Find captain by socketId
                const captain = await captainModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { status: "inactive", socketId: null }, // Set status to inactive & remove socketId
                    { new: true }
                );

                if (captain) {
                    console.log(`🚨 Captain ${captain._id} set to inactive.`);
                }
            } catch (error) {
                console.error("❌ Error updating captain status on disconnect:", error);
            }
        });
    });
};

function sendMessageToSocketId(socketId, messageObject) {
    try {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } catch (error) {
        console.error("❌ Error sending message via socket:", error.message);
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
