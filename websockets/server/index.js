import express from "express";
import http from "http";
import { Server } from "socket.io";

// creating a express server
const app = express();

// creating a raw http server and we are coupling it with our express app so that the app can handle both sockets and http
const server = http.createServer(app);

// we need this raw server because it handles http --> ws upgrade
const io = new Server(server, {
    cors: {
        origin: '*',
    }
})

let clients = {}

io.on("connection", (socket) => {
    console.log("new user connected :", socket.id)

    // use socket.on to listen to events from this specific client
    socket.on("join-room", (roomName, userName) => {
        socket.join(roomName); // socket.join logically groups clients (any broadcasting done is only reflected to that room)
        clients[socket.id] = {
            roomName: roomName,
            userName: userName
        }
        // notifying other users in the room (except the new user)
        socket.to(roomName).emit('user-joined', `welcome ${userName}`);
    });

    // handle incoming chat message
    socket.on("chat-message", (data) => {
        const user = clients[socket.id];
        if (user) {
            // broadcast the message to everyone in the same room except the sender
            // no need of .broadcast.emit when using to(_)
            socket.to(user.roomName).emit("chat-message", {
                userName: user.userName,
                message:data.message,
            });
        }
    });

    // clean up when client is disconnected
    socket.on('disconnect', () => {
        const user = clients[socket.id];
        if (user) {
            socket.to(user.roomName).emit("user-left", `${user.userName} left`);
        }
        delete clients[socket.id];
    });
});

const PORT = 4000;

// Test route
app.get("/", (req, res) => {
  res.send("WebSocket Server Running");
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
