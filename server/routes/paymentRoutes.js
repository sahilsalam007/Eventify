import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
} from "../controllers/paymentController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Razorpay webhook (no customer JWT authentication)
router.post("/webhook", handleRazorpayWebhook);

// Customer payment routes
router.post("/orders", protect, authorize("customer"), createPaymentOrder);

router.post("/verify", protect, authorize("customer"), verifyPayment);

export default router;
