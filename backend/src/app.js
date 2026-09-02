const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const libraryStaffRoutes = require("./routes/libraryStaffRoutes");
const labStaffRoutes = require("./routes/labStaffRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS configuration with local fallback so a missing CLIENT_ORIGIN env var
// can never silently disable CORS headers.
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? (process.env.CLIENT_ORIGIN === "*" ? true : process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()))
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Serve uploaded photos/resource files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Serve static test/demo pages placed in /public (e.g. the notification tester)
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("/api/health", (req, res) => res.json({ success: true, message: "Smart Campus API is running." }));

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/library-staff", libraryStaffRoutes);
app.use("/api/lab-staff", labStaffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;