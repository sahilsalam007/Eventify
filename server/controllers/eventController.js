import mongoose from "mongoose";
import Event from "../models/Event.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eventType,
      venue,
      onlineLink,
      startDate,
      endDate,
      coverImage,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !eventType ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required event details",
      });
    }

    // Only organizers can create events
    if (req.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Only organizers can create events",
      });
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      category,
      organizer: req.user._id,
      eventType,
      venue,
      onlineLink,
      startDate,
      endDate,
      coverImage,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
    } catch (error) {
    console.error("Create event error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This record already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating event",
    });
  }
};

// Get all published events
export const getAllEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      eventType,
      city,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      status: "published",
    };

    // Search events by title
    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by event type
    if (eventType) {
      filter.eventType = eventType;
    }

    // Filter by city
    if (city) {
      filter["venue.city"] = {
        $regex: city,
        $options: "i",
      };
    }

    // Sort events
    let sortOption = { startDate: 1 };

    if (sort === "latest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "date-desc") {
      sortOption = { startDate: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const skip = (pageNumber - 1) * limitNumber;

    const totalEvents = await Event.countDocuments(filter);

    const events = await Event.find(filter)
      .populate("organizer", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalEvents / limitNumber);

    return res.status(200).json({
      success: true,
      count: events.length,
      totalEvents,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Publish an event
export const publishEvent = async (req, res) => {
  try {
        // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check event ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only publish your own events",
      });
    }

    // Check if already published
    if (event.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Event is already published",
      });
    }

    if (event.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft events can be published",
      });
    }

    event.status = "published";

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event published successfully",
      event,
    });
    } catch (error) {
    console.error("Publish event error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while publishing event",
    });
  }
};

// Get single published event
export const getSingleEvent = async (req, res) => {
  try {
    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }
    const event = await Event.findOne({
      _id: req.params.id,
      status: "published",
    }).populate("organizer", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get single event error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching event",
    });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
        // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check event ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own events",
      });
    }

    // Prevent editing completed or cancelled events
    if (["completed", "cancelled"].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: "Completed or cancelled events cannot be updated",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "eventType",
      "venue",
      "onlineLink",
      "startDate",
      "endDate",
      "coverImage",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
    } catch (error) {
    console.error("Update event error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating event",
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
        // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }

    if (["completed", "cancelled"].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: "Completed or cancelled events cannot be deleted",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
    } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting event",
    });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
