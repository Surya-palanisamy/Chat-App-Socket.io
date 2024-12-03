// Import packages
const express = require("express");
const http = require("http");
const socketio = require("socket.io");

// Create an instance of Express
const app = express();

// Create an HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

// Users array
let users = [];

// Helper functions
const addUser = (id, name, room) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.name === name && user.room === room
  );
  if (existingUser) return { error: "Username is taken in this room" };

  const user = { id, name, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", ({ name, room }, callback) => {
    const { user, error } = addUser(socket.id, name, room);

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    // Welcome message for the user
    socket.emit("message", {
      user: "admin",
      text: `Welcome to the room, ${user.name}!`,
    });

    // Broadcast to others in the room
    socket.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined the room!`,
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", { user: user.name, text: message });
    }

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
    }

    console.log("A user disconnected:", socket.id);
  });
});

// Define a basic route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT);
