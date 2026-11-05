import mongoose from "mongoose";

import Event from "../models/Event.js";
import TicketType from "../models/TicketType.js";
import Booking from "../models/Booking.js";

import { reserveTickets, releaseTickets } from "../services/ticketService.js";

// Create a new booking

export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { eventId } = req.params;
    const { tickets } = req.body;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Validate ticket selection
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one ticket",
      });
    }

    // Validate each selection
    for (const ticket of tickets) {
      if (
        !ticket.ticketType ||
        !mongoose.Types.ObjectId.isValid(ticket.ticketType) ||
        !Number.isInteger(ticket.quantity) ||
        ticket.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket selection",
        });
      }
    }

    // Prevent duplicate ticket types
    const ticketTypeIds = tickets.map((ticket) => ticket.ticketType.toString());

    if (new Set(ticketTypeIds).size !== ticketTypeIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate ticket types are not allowed",
      });
    }

    let booking;

    await session.withTransaction(async () => {
      // Check event inside transaction
      const event = await Event.findOne({
        _id: eventId,
        status: "published",
      }).session(session);

      if (!event) {
        throw new Error("Published event not found");
      }

      let totalAmount = 0;
      const bookingTickets = [];

      // Reserve tickets inside transaction
      for (const selectedTicket of tickets) {
        const ticketType = await TicketType.findOne({
          _id: selectedTicket.ticketType,
          event: eventId,
          isActive: true,
        }).session(session);

        if (!ticketType) {
          throw new Error("Invalid or inactive ticket type");
        }

        await reserveTickets(ticketType._id, selectedTicket.quantity, session);

        const subtotal = ticketType.price * selectedTicket.quantity;

        totalAmount += subtotal;

        bookingTickets.push({
          ticketType: ticketType._id,
          name: ticketType.name,
          quantity: selectedTicket.quantity,
          price: ticketType.price,
          subtotal,
        });
      }

      // Generate booking reference
      const bookingReference = `EVT-${new mongoose.Types.ObjectId()
        .toString()
        .toUpperCase()}`;

      // Create booking inside transaction
      const createdBookings = await Booking.create(
        [
          {
            bookingReference,
            customer: req.user._id,
            event: eventId,
            tickets: bookingTickets,
            totalAmount,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        ],
        { session },
      );

      booking = createdBookings[0];
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create booking",
    });
  } finally {
    await session.endSession();
  }
};

// Get logged-in customer's bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
    })
      .populate("event", "title startDate endDate coverImage")
      .sort({ bookedAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch bookings",
    });
  }
};

// Get single booking details
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user._id,
    })
      .populate("event", "title description startDate endDate venue coverImage")
      .populate("tickets.ticketType", "name description");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch booking details",
    });
  }
};

// Cancel a pending booking

export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookingId } = req.params;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    let booking;

    await session.withTransaction(async () => {
      // Find and cancel only a pending booking belonging to this customer
      booking = await Booking.findOneAndUpdate(
        {
          _id: bookingId,
          customer: req.user._id,
          bookingStatus: "pending",
        },
        {
          $set: {
            bookingStatus: "cancelled",
          },
        },
        {
          returnDocument: "after",
          session,
        },
      );

      if (!booking) {
        return;
      }

      // Release all reserved tickets inside the transaction
      for (const ticket of booking.tickets) {
        await releaseTickets(ticket.ticketType, ticket.quantity, session);
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or cannot be cancelled",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel booking",
    });
  } finally {
    await session.endSession();
  }
};
