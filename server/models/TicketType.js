import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Ticket name is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Ticket price is required"],
      min: [0, "Ticket price cannot be negative"],
    },

    totalQuantity: {
      type: Number,
      required: [true, "Ticket quantity is required"],
      min: [1, "At least one ticket must be available"],
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: [0, "Available quantity cannot be negative"],
    },

    salesStart: {
      type: Date,
      default: Date.now,
    },

    salesEnd: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const TicketType = mongoose.model("TicketType", ticketTypeSchema);

export default TicketType;