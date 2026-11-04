import express from "express";
import {
  createTicketType,
  getEventTicketTypes,
  updateTicketType,
  deleteTicketType,
} from "../controllers/ticketController.js";
import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - Get ticket types for an event
router.get(
  "/:eventId/tickets",
  getEventTicketTypes
);

// Organizer-only route - Create ticket type
router.post(
  "/:eventId/tickets",
  protect,
  authorize("organizer"),
  createTicketType
);

// Organizer-only route - Update ticket type
router.put(
  "/tickets/:ticketId",
  protect,
  authorize("organizer"),
  updateTicketType
);

// Organizer-only route - Delete ticket type
router.delete(
  "/tickets/:ticketId",
  protect,
  authorize("organizer"),
  deleteTicketType
);
export default router;