
import TicketType from "../models/TicketType.js";

// Reserve tickets safely without overselling
export const reserveTickets = async (ticketTypeId, quantity, session) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Invalid ticket quantity");
  }

  const currentDate = new Date();

  const ticketType = await TicketType.findOneAndUpdate(
    {
      _id: ticketTypeId,
      isActive: true,
      availableQuantity: { $gte: quantity },
      salesStart: { $lte: currentDate },
      salesEnd: { $gte: currentDate },
    },
    { $inc: { availableQuantity: -quantity } },
    {
      returnDocument: "after",
      runValidators: true,
      session,
    }
  );

  if (!ticketType) {
    throw new Error(
      "Tickets are unavailable, sales have ended, or insufficient tickets remain"
    );
  }

  return ticketType;
};

// Release reserved tickets safely
export const releaseTickets = async (ticketTypeId, quantity, session) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Invalid ticket quantity");
  }

  const ticketType = await TicketType.findOneAndUpdate(
    {
      _id: ticketTypeId,
      $expr: {
        $lte: [
          { $add: ["$availableQuantity", quantity] },
          "$totalQuantity",
        ],
      },
    },
    { $inc: { availableQuantity: quantity } },
    {
      returnDocument: "after",
      runValidators: true,
      session,
    }
  );

  if (!ticketType) {
    throw new Error("Unable to release tickets");
  }

  return ticketType;
};
