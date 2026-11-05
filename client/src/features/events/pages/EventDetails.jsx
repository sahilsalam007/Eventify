import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, MapPin, Clock, Ticket } from "lucide-react";
import api from "../../../services/api";

function EventDetails() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [booking, setBooking] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentOrder, setPaymentOrder] = useState(null);

  const openRazorpayCheckout = () => {
    if (!window.Razorpay || !paymentOrder || !booking) {
      alert("Payment checkout is not ready. Please try again.");
      return;
    }
    setPaymentMessage("");
    const options = {
      key: paymentOrder.keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: "Eventify",
      description: `Booking ${booking.bookingReference}`,
      order_id: paymentOrder.orderId,

      modal: {
        ondismiss: function () {
          setPaymentMessage(
            "Payment window closed. Your booking is still pending.",
          );
        },
      },

      handler: async function (response) {
        try {
          const verificationResponse = await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          console.log("Payment verification:", verificationResponse.data);

          if (verificationResponse.data.success) {
            setPaymentSuccess(true);
          }
        } catch (error) {
          console.error(
            "Payment verification failed:",
            error.response?.data || error.message,
          );

          alert("Payment verification failed. Please contact support.");
        }
      },

      prefill: {},

      theme: {
        color: "#6D45D9",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);

      setPaymentMessage(
        response.error.description || "Payment failed. Please try again.",
      );
    });

    razorpay.open();
  };

  const totalAmount = ticketTypes.reduce((total, ticket) => {
    const quantity = quantities[ticket._id] || 0;
    return total + ticket.price * quantity;
  }, 0);

  const totalTickets = Object.values(quantities).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const [eventResponse, ticketResponse] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/events/${eventId}/tickets`),
        ]);

        setEvent(eventResponse.data.event);
        setTicketTypes(ticketResponse.data.ticketTypes || []);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
        setError("Unable to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (loading) {
    return (
      <p className="min-h-screen bg-[#0b1020] pt-32 text-center text-gray-400">
        Loading event details...
      </p>
    );
  }

  if (error || !event) {
    return (
      <p className="min-h-screen bg-[#0b1020] pt-32 text-center text-red-400">
        {error || "Event not found."}
      </p>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <main className="min-h-screen bg-[#0b1020] px-6 pb-20 pt-28 text-white lg:px-20">
      <div className="mx-auto max-w-6xl">
        <img
          src={event.coverImage}
          alt={event.title}
          className="h-72 w-full rounded-2xl object-cover md:h-96"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_350px]">
          <section>
            <span className="rounded-full bg-purple-600/20 px-4 py-2 text-sm text-purple-300">
              {event.category}
            </span>

            <h1 className="mt-6 text-3xl font-bold md:text-5xl">
              {event.title}
            </h1>

            <div className="mt-8 space-y-5 text-gray-300">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-purple-400" />
                {startDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-purple-400" />
                {startDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {endDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-purple-400" />
                {event.eventType === "online"
                  ? "Online Event"
                  : `${event.venue?.name || ""}, ${event.venue?.city || ""}`}
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-semibold">About This Event</h2>
              <p className="mt-4 leading-8 text-gray-400">
                {event.description}
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-white/10 bg-[#141b31] p-6">
            <h2 className="text-xl font-semibold">Available Tickets</h2>

            <div className="mt-6 space-y-4">
              {ticketTypes.length === 0 && (
                <p className="text-sm text-gray-400">
                  No tickets are currently available.
                </p>
              )}

              {ticketTypes.map((ticket) => (
                <div
                  key={ticket._id}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">{ticket.name}</h3>
                    <Ticket className="text-purple-400" size={18} />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-purple-400">
                    ₹{ticket.price}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    {ticket.availableQuantity} tickets available
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <label
                      htmlFor={`quantity-${ticket._id}`}
                      className="text-sm text-gray-300"
                    >
                      Quantity
                    </label>

                    <input
                      id={`quantity-${ticket._id}`}
                      type="number"
                      min="0"
                      max={ticket.availableQuantity}
                      value={quantities[ticket._id] || 0}
                      onChange={(e) => {
                        const value = Math.max(
                          0,
                          Math.min(
                            Number(e.target.value),
                            ticket.availableQuantity,
                          ),
                        );

                        setQuantities((previous) => ({
                          ...previous,
                          [ticket._id]: value,
                        }));
                      }}
                      className="w-20 rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-center text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Selected Tickets</span>
                <span>{totalTickets}</span>
              </div>

              <div className="mt-3 flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-purple-400">₹{totalAmount}</span>
              </div>
            </div>
            <button
              disabled={totalTickets === 0}
              onClick={async () => {
                try {
                  const selectedTickets = Object.entries(quantities)
                    .filter(([, quantity]) => quantity > 0)
                    .map(([ticketType, quantity]) => ({
                      ticketType,
                      quantity,
                    }));

                  const response = await api.post(
                    `/events/${eventId}/bookings`,
                    {
                      tickets: selectedTickets,
                    },
                  );

                  setBooking(response.data.booking);
                  console.log("Booking created:", response.data.booking);
                } catch (error) {
                  console.error(
                    "Booking failed:",
                    error.response?.data || error.message,
                  );
                }
              }}
              className="mt-6 w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to Booking
            </button>
            {booking && (
              <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                <h3 className="font-semibold text-green-400">
                  Booking Created Successfully!
                </h3>

                <p className="mt-2 text-sm text-gray-300">
                  Booking Reference: {booking.bookingReference}
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  Amount: ₹{booking.totalAmount}
                </p>

                <p className="mt-2 text-sm text-yellow-400">Payment Pending</p>
              </div>
            )}
            {paymentSuccess && (
              <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                <h3 className="font-semibold text-green-400">
                  Payment Successful!
                </h3>

                <p className="mt-2 text-sm text-gray-300">
                  Your booking has been confirmed.
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  Booking Reference: {booking?.bookingReference}
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  Payment Status: Paid
                </p>
              </div>
            )}
            {paymentMessage && (
              <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-400">{paymentMessage}</p>
              </div>
            )}
            {booking && (
              <button
                disabled={paymentLoading}
                onClick={async () => {
                  try {
                    setPaymentLoading(true);

                    const response = await api.post("/payments/orders", {
                      bookingId: booking._id,
                    });

                    setPaymentOrder(response.data);
                    console.log("Razorpay order created:", response.data);
                  } catch (error) {
                    console.error(
                      "Payment order failed:",
                      error.response?.data || error.message,
                    );
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
                className="mt-4 w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
              >
                {paymentLoading ? "Preparing Payment..." : "Pay Now"}
              </button>
            )}
            {paymentOrder && (
              <button
                onClick={openRazorpayCheckout}
                className="mt-4 w-full rounded-xl border border-purple-500 px-5 py-3 font-semibold text-purple-300 transition hover:bg-purple-600 hover:text-white"
              >
                Open Razorpay Checkout
              </button>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default EventDetails;
