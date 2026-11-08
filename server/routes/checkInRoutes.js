
import express from "express";

import { checkInTicket } from "../controllers/checkInController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Organizer-only route - Check in a ticket
router.post(
  "/check-in",
  protect,
  authorize("organizer"),
  checkInTicket,
);

export default router;
