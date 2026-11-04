import express from "express"

import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController.js";

import protect,{
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/profile", protect, getUserProfile);

// Organizer-only test route
router.get(
  "/organizer-test",
  protect,
  authorize("organizer"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome, Organizer!",
    });
  }
);

export default router;