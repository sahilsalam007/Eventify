
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { expirePendingBookings } from "./services/bookingExpiryService.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Razorpay webhook needs the raw request body
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
);

// JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/auth", authRoutes);

// Event routes
app.use("/api/events", bookingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", ticketRoutes);

// Payment routes
app.use("/api/payments", paymentRoutes);

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

  let expiryJobRunning = false;

  const runExpiryJob = async () => {
    if (expiryJobRunning) return;

    expiryJobRunning = true;

    try {
      const expiredCount = await expirePendingBookings();

      if (expiredCount > 0) {
        console.log(
          `Booking expiry completed: ${expiredCount} booking(s) checked`
        );
      }
    } catch (error) {
      console.error("Booking expiry scheduler error:", error);
    } finally {
      expiryJobRunning = false;
    }
  };

  // Run once when the server starts
  runExpiryJob();

  // Check for expired bookings every 30 seconds
  setInterval(runExpiryJob, 30 * 1000);
};

startServer();