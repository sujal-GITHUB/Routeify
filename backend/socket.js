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
        console.log(`User connected: ${socket.id}`);

        socket.on("join", async (data) => {
            try {
                const { userId, userType } = data;

                if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                    console.error(`Invalid userId: ${userId}`);
                    return socket.emit("error", { message: "Invalid userId" });
                }

                console.log(`${userType} joined with ${userId}`);

                if (userType === "user") {
                    await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                } else if (userType === "captain") {
                    await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
                } else {
                    console.error(`Invalid userType: ${userType}`);
                    return socket.emit("error", { message: "Invalid userType" });
                }
            } catch (error) {
                console.error("Error in join event:", error);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("update-location-captain", async (data) => {
            try {
                const { userId, location } = data;

                if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                    return socket.emit("error", { message: "Invalid userId" });
                }

                if (!location || !location.latitude || !location.longitude) {
                    return socket.emit("error", { message: "Invalid location data" });
                }

                await captainModel.findByIdAndUpdate(userId, {
                    location: {
                        lat: location.latitude,
                        lng: location.longitude
                    }
                });

                console.log(`Updated location for captain ${userId} : ${location.latitude} ${location.longitude}`);
            } catch (error) {
                console.error("Error updating location:", error);
                socket.emit("error", { message: "Failed to update location" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
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
