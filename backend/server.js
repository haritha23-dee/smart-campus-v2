require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets");
const { scheduleDeadlineEngine } = require("./src/jobs/deadlineEngine");
const ensureBootstrapAdmin = require("./src/utils/bootstrapAdmin");
const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  await ensureBootstrapAdmin();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN === "*" ? "*" : process.env.CLIENT_ORIGIN?.split(",") },
  });
  initSocket(io);
  scheduleDeadlineEngine();
  server.listen(PORT, () => {
    console.log(`[Server] Smart Campus API listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  });
};
start().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
