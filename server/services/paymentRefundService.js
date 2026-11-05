import Payment from "../models/Payment.js";

export const refundLatePayment = async (payment, razorpayPaymentId) => {
  const receipt = `evt_${payment._id}`;
  const idempotencyKey = `evt_rf_${payment._id}`;

  // Claim the refund operation
  const retryBefore = new Date(Date.now() - 2 * 60 * 1000);

  const claimedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      razorpayPaymentId: {
        $in: [null, razorpayPaymentId],
      },
      $or: [
        { status: { $in: ["created", "failed"] } },
        {
          status: "refunding",
          updatedAt: { $lte: retryBefore },
        },
      ],
    },
    {
      $set: {
        status: "refunding",
        razorpayPaymentId,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!claimedPayment) {
    const currentPayment = await Payment.findById(payment._id);

    if (currentPayment?.status === "refunded") {
      return currentPayment;
    }

    throw new Error("Refund is already being processed");
  }

  // Use Razorpay's idempotent refund API
  const credentials = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${razorpayPaymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "X-Refund-Idempotency": idempotencyKey,
      },
      body: JSON.stringify({
        amount: payment.amount * 100,
        receipt,
        notes: {
          reason: "Booking expired before payment confirmation",
          bookingId: payment.booking.toString(),
        },
      }),
    },
  );

  const refund = await response.json();

  if (!response.ok) {
    throw new Error(
      refund.error?.description || "Razorpay refund request failed",
    );
  }

  // A refund may be pending, so don't mark it refunded prematurely
  await Payment.findByIdAndUpdate(payment._id, {
    $set: {
      status: refund.status === "processed" ? "refunded" : "refunding",
      razorpayRefundId: refund.id,
    },
  });

  return refund;
};