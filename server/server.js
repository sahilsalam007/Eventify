import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/auth", authRoutes);

// Event routes
app.use("/api/events", bookingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", ticketRoutes);
// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Eventify API 🚀",
    environment: process.env.NODE_ENV,
  });
});


// Start server after database connection
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Eventify server running on port ${PORT}`);
  });
};

startServer();