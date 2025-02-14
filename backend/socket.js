const { Server } = require('socket.io');
const userModel = require('./models/user.model')
const captainModel = require('./models/captain.model')
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

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join',async(data)=>{
            const {userId, userType} = data

            if(userType == 'user'){
                await userModel.findByIdAndUpdate(
                    userId, 
                    {
                        socketId: socket.id
                    }
                )
            }
            else if(userType == 'captain'){
                await captainModel.findByIdAndUpdate(
                    capatinId, 
                    {
                        socketId: socket.id
                    }
                )
            }
        })
        
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

function sendMessageToSocketId(socketId, message) {
    if (io) {
        io.to(socketId).emit('message', message);
    } else {
        console.error('Socket not initialized');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
