import express from "express";

import {
  createEvent,
  getAllEvents,
  publishEvent,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/eventController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - Get all published events
router.get("/", getAllEvents);

// Organizer-only route - Get my events
router.get(
  "/my-events",
  protect,
  authorize("organizer"),
  getMyEvents
);

// Public route - Get single published event
router.get("/:id", getSingleEvent);

// Organizer-only route - Create event
router.post("/", protect, authorize("organizer"), createEvent);

// Organizer-only route - Publish event
router.patch("/:id/publish", protect, authorize("organizer"), publishEvent);
// Organizer-only route - Update event
router.put("/:id", protect, authorize("organizer"), updateEvent);

// Organizer-only route - Delete event
router.delete("/:id", protect, authorize("organizer"), deleteEvent);
export default router;
