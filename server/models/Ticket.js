
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketReference: {
      type: String,
      required: true,
      unique: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    ticketType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
      required: true,
    },

    qrToken: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["valid", "used", "cancelled"],
      default: "valid",
    },

    checkedInAt: {
      type: Date,
      default: null,
    },

    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
