
import QRCode from "qrcode";
import Ticket from "../models/Ticket.js";

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      customer: req.user._id,
      status: { $ne: "cancelled" },
    })
      .select("+qrToken")
      .populate("event", "title startDate endDate venue eventType")
      .populate("ticketType", "name price")
      .populate("booking", "bookingReference")
      .sort({ createdAt: -1 });

    const formattedTickets = await Promise.all(
      tickets.map(async (ticket) => ({
        _id: ticket._id,
        ticketReference: ticket.ticketReference,
        qrCode: await QRCode.toDataURL(ticket.qrToken, {
          errorCorrectionLevel: "H",
          margin: 2,
          width: 300,
        }),
        status: ticket.status,
        checkedInAt: ticket.checkedInAt,
        event: ticket.event,
        ticketType: ticket.ticketType,
        booking: ticket.booking,
        createdAt: ticket.createdAt,
      })),
    );

    return res.status(200).json({
      success: true,
      count: formattedTickets.length,
      tickets: formattedTickets,
    });
  } catch (error) {
    console.error("Get my tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve tickets",
    });
  }
};
