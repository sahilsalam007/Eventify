
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import { releaseTickets } from "./ticketService.js";

export const expirePendingBookings = async () => {
  const now = new Date();

  // Find bookings whose payment deadline has passed
  const expiredBookings = await Booking.find({
    bookingStatus: "pending",
    paymentStatus: "pending",
    expiresAt: { $lte: now },
  })
    .select("_id")
    .limit(100);

  for (const item of expiredBookings) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Expire only if the booking is still pending
        const booking = await Booking.findOneAndUpdate(
          {
            _id: item._id,
            bookingStatus: "pending",
            paymentStatus: "pending",
            expiresAt: { $lte: now },
          },
          {
            $set: {
              bookingStatus: "expired",
            },
          },
          {
            returnDocument: "after",
            session,
          }
        );

        // Another operation may already have changed this booking
        if (!booking) {
          return;
        }

        // Release all reserved tickets
        for (const ticket of booking.tickets) {
          await releaseTickets(
            ticket.ticketType,
            ticket.quantity,
            session
          );
        }
      });
    } catch (error) {
      console.error(
        `Booking expiry failed for ${item._id}:`,
        error.message
      );
    } finally {
      await session.endSession();
    }
  }

  return expiredBookings.length;
};
