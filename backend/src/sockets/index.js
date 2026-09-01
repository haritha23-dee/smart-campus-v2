const jwt = require("jsonwebtoken");
let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });
  io.on("connection", (socket) => {
    socket.join(socket.userId.toString());
    console.log(`[Socket] User ${socket.userId} connected (${socket.id})`);

    socket.on("disconnect", () => {
      console.log(`[Socket] User ${socket.userId} disconnected (${socket.id})`);
    });
  });
};

const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(userId.toString()).emit(event, payload);
};

module.exports = { initSocket, emitToUser };
