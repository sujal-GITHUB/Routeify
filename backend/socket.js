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

function sendMessageToSocketId(socketId, message) {
    if (io) {
        io.to(socketId).emit("message", message);
    } else {
        console.error("Socket not initialized");
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
