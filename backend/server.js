const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const validateEnv = require("./config/validateEnv.js");

const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/Auth");
const inquiryRoutes = require("./routes/inquiryRoutes.js");
const noticeRoutes = require("./routes/noticeRoutes.js");
const applicationRoutes = require("./routes/applicationRoutes");
const contactRoutes = require("./routes/contactRoutes.js");
const teacherRoutes = require("./routes/teacherRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js")

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
validateEnv();
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", chatRoutes);


// Connect to mongodb with try-catch
async function connectDB() {
  if (!process.env.MONGO_URL) {
    console.warn("WARNING: MONGO_URL not found. Skipping database connection. API endpoints that require the database will not work.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(" connected to mongodb");
  } catch (error) {
    console.log(" Database connection failed:", error.message);
    process.exit(1);
  }
}

connectDB();

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});