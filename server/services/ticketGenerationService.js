import crypto from "crypto";

import Ticket from "../models/Ticket.js";

export const createTicketsForBooking = async (booking, session) => {
  const existingTickets = await Ticket.find({
    booking: booking._id,
  }).session(session);

  const expectedTicketCount = booking.tickets.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  if (existingTickets.length > 0) {
    if (existingTickets.length !== expectedTicketCount) {
      throw new Error("Ticket generation is incomplete for this booking");
    }

    return existingTickets;
  }
  const ticketDocuments = [];
  let ticketNumber = 1;

  for (const item of booking.tickets) {
    for (let i = 0; i < item.quantity; i++) {
      ticketDocuments.push({
        ticketReference: `TKT-${booking._id}-${ticketNumber}`,

        booking: booking._id,
        customer: booking.customer,
        event: booking.event,
        ticketType: item.ticketType,

        qrToken: crypto.randomBytes(32).toString("hex"),
      });

      ticketNumber++;
    }
  }

  if (ticketDocuments.length === 0) {
    throw new Error("No tickets found in this booking");
  }

  return Ticket.insertMany(ticketDocuments, {
    session,
    ordered: true,
  });
};
