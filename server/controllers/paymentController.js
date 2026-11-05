import crypto from "crypto";
import mongoose from "mongoose";
import { refundLatePayment } from "../services/paymentRefundService.js";
import razorpay from "../config/razorpay.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// Create Razorpay order
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const customerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: customerId,
      bookingStatus: "pending",
      paymentStatus: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Pending booking not found",
      });
    }

    // Prevent creating another order for the same booking
    const existingPayment = await Payment.findOne({
      booking: booking._id,
      status: "created",
    });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Payment order already exists",
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: existingPayment.razorpayOrderId,
        amount: existingPayment.amount * 100,
        currency: existingPayment.currency,
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: booking.totalAmount * 100,
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        customerId: customerId.toString(),
      },
    });

    const payment = await Payment.create({
      booking: booking._id,
      customer: customerId,
      razorpayOrderId: razorpayOrder.id,
      amount: booking.totalAmount,
      currency: "INR",
      status: "created",
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: payment.razorpayOrderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};

// Verify Razorpay payment

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    // Find the payment belonging to this customer
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      customer: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Handle duplicate verification requests
    if (payment.status === "paid") {
      if (payment.razorpayPaymentId !== razorpay_payment_id) {
        return res.status(400).json({
          success: false,
          message: "Payment ID does not match",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(generatedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Fetch payment directly from Razorpay
    let razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    // Confirm the payment belongs to the expected order and amount
    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.amount !== payment.amount * 100 ||
      razorpayPayment.currency !== payment.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match",
      });
    }

    // Check whether the booking is still valid
    const booking = await Booking.findOne({
      _id: payment.booking,
      customer: req.user._id,
    });

    const bookingExpired =
      !booking ||
      booking.bookingStatus !== "pending" ||
      booking.paymentStatus !== "pending" ||
      !booking.expiresAt ||
      booking.expiresAt <= new Date();

    if (bookingExpired) {
      if (razorpayPayment.status === "captured") {
        await refundLatePayment(payment, razorpay_payment_id);

        return res.status(409).json({
          success: false,
          message: "Booking expired. Payment refund has been initiated.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Booking has expired or is no longer available",
      });
    }

    // Capture authorized payments
    if (razorpayPayment.status === "authorized") {
      razorpayPayment = await razorpay.payments.capture(
        razorpay_payment_id,
        payment.amount * 100,
        payment.currency,
      );
    }

    if (razorpayPayment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment has not been captured",
      });
    }

    // Update payment and booking together
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const updatedPayment = await Payment.findOneAndUpdate(
          {
            _id: payment._id,
            status: { $in: ["created", "failed"] },
          },
          {
            $set: {
              status: "paid",
              razorpayPaymentId: razorpay_payment_id,
              paymentMethod: razorpayPayment.method,
            },
          },
          {
            returnDocument: "after",
            session,
          },
        );

        if (!updatedPayment) {
          throw new Error("Payment was already processed");
        }

        const updatedBooking = await Booking.findOneAndUpdate(
          {
            _id: payment.booking,
            customer: req.user._id,
            bookingStatus: "pending",
            paymentStatus: "pending",
            expiresAt: { $gt: new Date() },
          },
          {
            $set: {
              bookingStatus: "confirmed",
              paymentStatus: "paid",
            },
          },
          {
            returnDocument: "after",
            session,
          },
        );

        if (!updatedBooking) {
          throw new Error("Booking cannot be confirmed");
        }
      });
    } catch (error) {
      // Check the latest payment and booking after transaction failure
      const [latestPayment, latestBooking] = await Promise.all([
        Payment.findById(payment._id),
        Booking.findById(payment.booking),
      ]);

      // Another request may have successfully confirmed this payment
      if (
        latestPayment?.status === "paid" &&
        latestPayment.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
        });
      }

      const bookingNoLongerAvailable =
        !latestBooking ||
        latestBooking.bookingStatus !== "pending" ||
        latestBooking.paymentStatus !== "pending" ||
        !latestBooking.expiresAt ||
        latestBooking.expiresAt <= new Date();

      // Refund captured payment if booking can no longer be confirmed
      if (razorpayPayment.status === "captured" && bookingNoLongerAvailable) {
        await refundLatePayment(payment, razorpay_payment_id);

        return res.status(409).json({
          success: false,
          message:
            "Booking is no longer available. Payment refund has been initiated.",
        });
      }

      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

// Handle Razorpay webhooks
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !webhookSignature || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook request",
      });
    }

    // Verify webhook signature using the original raw body
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (!/^[a-f0-9]{64}$/i.test(webhookSignature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const expectedBuffer = Buffer.from(generatedSignature, "hex");
    const receivedBuffer = Buffer.from(webhookSignature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Webhook signature verification failed",
      });
    }

    const webhookEvent = JSON.parse(req.body.toString("utf8"));

    // Handle successful payment
    if (
      webhookEvent.event === "payment.captured" ||
      webhookEvent.event === "order.paid"
    ) {
      const razorpayPayment = webhookEvent.payload?.payment?.entity;

      if (!razorpayPayment) {
        return res.status(400).json({
          success: false,
          message: "Payment information missing",
        });
      }

      const payment = await Payment.findOne({
        razorpayOrderId: razorpayPayment.order_id,
      });

      if (!payment) {
        console.error("Webhook payment record not found");

        return res.status(200).json({
          success: true,
          message: "Payment record not found; event acknowledged",
        });
      }

      // Validate payment amount and currency
      if (
        razorpayPayment.amount !== payment.amount * 100 ||
        razorpayPayment.currency !== payment.currency ||
        razorpayPayment.status !== "captured"
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment details do not match",
        });
      }

      // Ignore duplicate successful notifications
      if (payment.status === "paid") {
        if (payment.razorpayPaymentId !== razorpayPayment.id) {
          return res.status(400).json({
            success: false,
            message: "Payment ID does not match",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Payment already processed",
        });
      }

      // Already refunded
      if (payment.status === "refunded") {
        return res.status(200).json({
          success: true,
          message: "Payment refund already processed",
        });
      }

      // Check whether the booking is still valid
      const booking = await Booking.findOne({
        _id: payment.booking,
        customer: payment.customer,
      });

      const bookingExpired =
        !booking ||
        booking.bookingStatus !== "pending" ||
        booking.paymentStatus !== "pending" ||
        !booking.expiresAt ||
        booking.expiresAt <= new Date();

      // Refund captured payments for expired or unavailable bookings
      if (bookingExpired) {
        await refundLatePayment(payment, razorpayPayment.id);

        return res.status(200).json({
          success: true,
          message: "Booking unavailable. Payment refund initiated.",
        });
      }

      // Update payment and booking together
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const updatedPayment = await Payment.findOneAndUpdate(
            {
              _id: payment._id,
              status: { $in: ["created", "failed"] },
            },
            {
              $set: {
                status: "paid",
                razorpayPaymentId: razorpayPayment.id,
                paymentMethod: razorpayPayment.method,
              },
            },
            {
              returnDocument: "after",
              session,
            },
          );

          if (!updatedPayment) {
            throw new Error("Payment could not be updated");
          }

          const updatedBooking = await Booking.findOneAndUpdate(
            {
              _id: payment.booking,
              customer: payment.customer,
              bookingStatus: "pending",
              paymentStatus: "pending",
              expiresAt: { $gt: new Date() },
            },
            {
              $set: {
                bookingStatus: "confirmed",
                paymentStatus: "paid",
              },
            },
            {
              returnDocument: "after",
              session,
            },
          );

          if (!updatedBooking) {
            throw new Error("Booking could not be confirmed");
          }
        });
      } catch (error) {
        const [latestPayment, latestBooking] = await Promise.all([
          Payment.findById(payment._id),
          Booking.findById(payment.booking),
        ]);

        // Another request may have confirmed the payment
        if (
          latestPayment?.status === "paid" &&
          latestPayment.razorpayPaymentId === razorpayPayment.id
        ) {
          return res.status(200).json({
            success: true,
            message: "Payment already processed",
          });
        }

        // A refund may already be underway
        if (
          latestPayment?.status === "refunding" ||
          latestPayment?.status === "refunded"
        ) {
          return res.status(200).json({
            success: true,
            message: "Payment refund is already being processed",
          });
        }

        const bookingNoLongerAvailable =
          !latestBooking ||
          latestBooking.bookingStatus !== "pending" ||
          latestBooking.paymentStatus !== "pending" ||
          !latestBooking.expiresAt ||
          latestBooking.expiresAt <= new Date();

        // Refund the captured payment if expiry won the race
        if (bookingNoLongerAvailable) {
          await refundLatePayment(payment, razorpayPayment.id);

          return res.status(200).json({
            success: true,
            message: "Booking unavailable. Payment refund initiated.",
          });
        }

        // Let Razorpay retry if the failure was not caused by expiry
        throw error;
      } finally {
        await session.endSession();
      }
    }

    // Handle failed payment
    else if (webhookEvent.event === "payment.failed") {
      const razorpayPayment = webhookEvent.payload?.payment?.entity;

      if (!razorpayPayment) {
        return res.status(400).json({
          success: false,
          message: "Payment information missing",
        });
      }

      await Payment.findOneAndUpdate(
        {
          razorpayOrderId: razorpayPayment.order_id,
          status: "created",
        },
        {
          $set: {
            status: "failed",
            razorpayPaymentId: razorpayPayment.id,
            paymentMethod: razorpayPayment.method || null,
          },
        },
      );
    }
    // Handle refund status updates
    else if (
      webhookEvent.event === "refund.created" ||
      webhookEvent.event === "refund.processed" ||
      webhookEvent.event === "refund.failed"
    ) {
      const refund = webhookEvent.payload?.refund?.entity;

      if (!refund) {
        return res.status(400).json({
          success: false,
          message: "Refund information missing",
        });
      }

      const updateFields = {
        razorpayRefundId: refund.id,
      };

      if (refund.status === "processed") {
        updateFields.status = "refunded";
      }

      if (refund.status === "failed") {
        updateFields.status = "refund_failed";

        console.error(
          `Razorpay refund failed for payment ${refund.payment_id}:`,
          refund.id,
        );
      }

      await Payment.findOneAndUpdate(
        {
          razorpayPaymentId: refund.payment_id,
          status: { $ne: "refunded" },
        },
        {
          $set: updateFields,
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process webhook",
    });
  }
};
