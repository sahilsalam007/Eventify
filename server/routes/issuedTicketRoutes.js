
import express from "express";

import { getMyTickets } from "../controllers/issuedTicketController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer-only route - Get all my issued tickets
router.get(
  "/my-tickets",
  protect,
  authorize("customer"),
  getMyTickets,
);

export default router;
