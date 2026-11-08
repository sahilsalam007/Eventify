
import Ticket from "../models/Ticket.js";

export const checkInTicket = async (req, res) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken || typeof qrToken !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid QR token is required",
      });
    }

    const ticket = await Ticket.findOne({ qrToken })
      .select("+qrToken")
      .populate("event", "title organizer startDate endDate status")
      .populate("ticketType", "name");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Invalid ticket QR code",
      });
    }

    if (!ticket.event) {
      return res.status(404).json({
        success: false,
        message: "Associated event not found",
      });
    }

    if (ticket.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to check in tickets for this event",
      });
    }

    if (ticket.event.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This event has been cancelled",
      });
    }

    if (ticket.status === "used") {
      return res.status(409).json({
        success: false,
        message: "This ticket has already been used",
        checkedInAt: ticket.checkedInAt,
      });
    }

    if (ticket.status !== "valid") {
      return res.status(400).json({
        success: false,
        message: "This ticket is not valid for check-in",
      });
    }

    const checkedInTicket = await Ticket.findOneAndUpdate(
      {
        _id: ticket._id,
        status: "valid",
      },
      {
        $set: {
          status: "used",
          checkedInAt: new Date(),
          checkedInBy: req.user._id,
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!checkedInTicket) {
      return res.status(409).json({
        success: false,
        message: "This ticket has already been checked in",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket checked in successfully",
      ticket: {
        ticketReference: checkedInTicket.ticketReference,
        status: checkedInTicket.status,
        checkedInAt: checkedInTicket.checkedInAt,
        event: ticket.event.title,
        ticketType: ticket.ticketType?.name,
      },
    });
  } catch (error) {
    console.error("Ticket check-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check in ticket",
    });
  }
};
