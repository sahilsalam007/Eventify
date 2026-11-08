import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/events/my-bookings");
        setBookings(response.data.bookings);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load your bookings.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      setCancelingId(bookingId);
      setError("");

      const response = await api.patch(`/events/bookings/${bookingId}/cancel`);

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId ? response.data.booking : booking,
        ),
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to cancel this booking.",
      );
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      confirmed: "bg-green-500/10 text-green-400",
      pending: "bg-yellow-500/10 text-yellow-400",
      cancelled: "bg-red-500/10 text-red-400",
      expired: "bg-gray-500/10 text-gray-400",
    };

    return styles[status] || styles.expired;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1020] flex items-center justify-center">
        <p className="text-purple-400 text-lg">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Booking History
        </h1>

        <p className="text-gray-400 mb-10">
          View and manage all your event bookings.
        </p>

        {error && (
          <p className="text-red-400 bg-red-400/10 p-4 rounded-lg">{error}</p>
        )}

        {!error && bookings.length === 0 && (
          <div className="bg-[#101A35] border border-white/10 rounded-xl p-10 text-center">
            <h2 className="text-xl text-white font-semibold mb-2">
              No bookings yet
            </h2>

            <p className="text-gray-400">
              Your event bookings will appear here.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-[#101A35] border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {booking.event?.title || "Event"}
                    </h2>

                    <p className="text-gray-400 text-sm mt-2">
                      Booking Reference: {booking.bookingReference}
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      Booked on: {new Date(booking.bookedAt).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`w-fit px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(
                      booking.bookingStatus,
                    )}`}
                  >
                    {booking.bookingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-gray-500 text-sm">Total Amount</p>

                    <p className="text-white font-semibold mt-1">
                      ₹{booking.totalAmount}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Payment Status</p>

                    <p className="text-white font-semibold mt-1 capitalize">
                      {booking.paymentStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Total Tickets</p>

                    <p className="text-white font-semibold mt-1">
                      {booking.tickets.reduce(
                        (total, ticket) => total + ticket.quantity,
                        0,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-gray-300 font-medium mb-3">
                    Ticket Breakdown
                  </p>

                  <div className="space-y-2">
                    {booking.tickets.map((ticket, index) => (
                      <div
                        key={ticket._id || index}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-400">
                          {ticket.name} × {ticket.quantity}
                        </span>

                        <span className="text-white">₹{ticket.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <Link
                    to={`/bookings/${booking._id}`}
                    className="rounded-lg bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition"
                  >
                    View Details
                  </Link>

                  {booking.bookingStatus === "pending" && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancelingId === booking._id}
                      className="rounded-lg border border-red-500/30 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {cancelingId === booking._id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyBookings;
