const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

// Load environment variables first
dotenv.config();

// Import and run environment validator
const { validateEnv, checkProductionSecurity } = require("./backend/utils/envValidator");
validateEnv();
checkProductionSecurity();

// Import routes
const authRoutes = require("./routes/Auth");
const inquiryRoutes = require("./routes/inquiryRoutes.js");
const noticeRoutes = require("./routes/noticeRoutes.js");
const applicationRoutes = require("./routes/applicationRoutes");
const contactRoutes = require("./routes/contactRoutes.js");
const teacherRoutes = require("./routes/teacherRoutes.js");

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/teacher", teacherRoutes);

// Database connection
async function connectDB() {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
  
  if (!mongoUrl) {
    console.warn("MONGODB_URI not found. Skipping database connection. API endpoints that require the database will not work.");
    return;
  }
  
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Database connection failed:", error.message);
    process.exit(1);
  }
}

connectDB();

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}).on("error", (err) => {
  console.log("Server error:", err.message);
  process.exit(1);
});