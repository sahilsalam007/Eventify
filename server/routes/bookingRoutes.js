import express from "express";

import {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
} from "../controllers/bookingController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer-only route - Get my bookings
router.get(
  "/my-bookings",
  protect,
  authorize("customer"),
  getMyBookings
);

// Customer-only route - Get single booking details
router.get(
  "/bookings/:bookingId",
  protect,
  authorize("customer"),
  getBookingDetails
);

// Customer-only route - Cancel a pending booking
router.patch(
  "/bookings/:bookingId/cancel",
  protect,
  authorize("customer"),
  cancelBooking
);

// Customer-only route - Create booking
router.post(
  "/:eventId/bookings",
  protect,
  authorize("customer"),
  createBooking
);

export default router;