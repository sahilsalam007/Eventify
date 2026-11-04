import Event from "../models/Event.js";
import TicketType from "../models/TicketType.js";
import mongoose from "mongoose";

// Create a new ticket type
export const createTicketType = async (req, res) => {
  try {
    const { name, description, price, totalQuantity, salesStart, salesEnd } =
      req.body;

    const { eventId } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Validate required fields
    if (
      !name ||
      price === undefined ||
      totalQuantity === undefined ||
      !salesEnd
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required ticket details",
      });
    }

    // Find event
    const event = await Event.findById(eventId);

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
        message: "You can only manage tickets for your own events",
      });
    }

    // Only draft or published events can have ticket types
    if (!["draft", "published"].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot add tickets to this event",
      });
    }

    // Validate price and quantity
    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(totalQuantity) ||
      totalQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket price or quantity",
      });
    }

    // Create ticket type
    const ticketType = await TicketType.create({
      event: eventId,
      name,
      description,
      price,
      totalQuantity,
      availableQuantity: totalQuantity,
      salesStart: salesStart || Date.now(),
      salesEnd,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket type created successfully",
      ticketType,
    });
  } catch (error) {
    console.error("Create ticket type error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating ticket type",
    });
  }
};

// Get all active ticket types for an event
export const getEventTicketTypes = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Check whether event exists and is published
    const event = await Event.findOne({
      _id: eventId,
      status: "published",
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Published event not found",
      });
    }

    // Get active ticket types
    const currentDate = new Date();

    const ticketTypes = await TicketType.find({
      event: eventId,
      isActive: true,
      availableQuantity: { $gt: 0 },
      salesStart: { $lte: currentDate },
      salesEnd: { $gte: currentDate },
    }).sort({ price: 1 });

    return res.status(200).json({
      success: true,
      count: ticketTypes.length,
      ticketTypes,
    });
  } catch (error) {
    console.error("Get ticket types error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching ticket types",
    });
  }
};

// Update an existing ticket type
export const updateTicketType = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const {
      name,
      description,
      price,
      totalQuantity,
      salesStart,
      salesEnd,
      isActive,
    } = req.body;

    // Validate ticket ID
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    // Find ticket type
    const ticketType = await TicketType.findById(ticketId);

    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: "Ticket type not found",
      });
    }

    // Find associated event
    const event = await Event.findById(ticketType.event);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Associated event not found",
      });
    }

    // Check organizer ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update tickets for your own events",
      });
    }

    // Prevent reducing quantity below already sold tickets
    const soldQuantity =
      ticketType.totalQuantity - ticketType.availableQuantity;

    // Prevent price changes after tickets have been sold
    if (soldQuantity > 0 && price !== undefined && price !== ticketType.price) {
      return res.status(400).json({
        success: false,
        message: "Cannot change ticket price after tickets have been sold",
      });
    }

    if (totalQuantity !== undefined) {
      if (
        !Number.isInteger(totalQuantity) ||
        totalQuantity < 1 ||
        totalQuantity < soldQuantity
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity or quantity is below tickets already sold",
        });
      }

      ticketType.availableQuantity = totalQuantity - soldQuantity;

      ticketType.totalQuantity = totalQuantity;
    }

    // Update allowed fields
    if (name !== undefined) ticketType.name = name;
    if (description !== undefined) ticketType.description = description;
    if (price !== undefined) ticketType.price = price;
    if (salesStart !== undefined) ticketType.salesStart = salesStart;
    if (salesEnd !== undefined) ticketType.salesEnd = salesEnd;
    if (isActive !== undefined) ticketType.isActive = isActive;

    await ticketType.save();

    return res.status(200).json({
      success: true,
      message: "Ticket type updated successfully",
      ticketType,
    });
  } catch (error) {
    console.error("Update ticket type error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating ticket type",
    });
  }
};

// Delete a ticket type
export const deleteTicketType = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Validate ticket ID
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    // Find ticket type
    const ticketType = await TicketType.findById(ticketId);

    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: "Ticket type not found",
      });
    }

    // Find associated event
    const event = await Event.findById(ticketType.event);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Associated event not found",
      });
    }

    // Check organizer ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete tickets for your own events",
      });
    }

    // Prevent deletion if tickets have been sold
    const soldQuantity =
      ticketType.totalQuantity - ticketType.availableQuantity;

    if (soldQuantity > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a ticket type with sold tickets",
      });
    }

    await ticketType.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Ticket type deleted successfully",
    });
  } catch (error) {
    console.error("Delete ticket type error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting ticket type",
    });
  }
};
