
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../../services/api";

function BookingDetails() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/events/bookings/${bookingId}`);
        setBooking(response.data.booking);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

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
        <p className="text-purple-400 text-lg">
          Loading booking details...
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#0B1020] flex flex-col items-center justify-center px-4">
        <p className="text-red-400 text-lg mb-5">
          {error || "Booking not found"}
        </p>

        <Link
          to="/my-bookings"
          className="text-purple-400 hover:text-purple-300"
        >
          Back to Booking History
        </Link>
      </div>
    );
  }

  const event = booking.event;
  const venue = event?.venue;

  return (
    <div className="min-h-screen bg-[#0B1020] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/my-bookings"
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          ← Back to Booking History
        </Link>

        <div className="mt-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Booking Details
          </h1>

          <p className="text-gray-400 mt-2">
            Complete information about your booking.
          </p>
        </div>

        <div className="bg-[#101A35] border border-white/10 rounded-2xl overflow-hidden">
          {event?.coverImage && (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-56 object-cover"
            />
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {event?.title || "Event"}
                </h2>

                <p className="text-gray-400 text-sm mt-2">
                  Booking Reference: {booking.bookingReference}
                </p>
              </div>

              <span
                className={`w-fit px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(
                  booking.bookingStatus
                )}`}
              >
                {booking.bookingStatus}
              </span>
            </div>

            {event?.description && (
              <p className="text-gray-400 leading-7 mt-6">
                {event.description}
              </p>
            )}

            <div className="border-t border-white/10 mt-8 pt-6">
              <h3 className="text-lg font-semibold text-white mb-5">
                Event Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Start Date</p>
                  <p className="text-white mt-1">
                    {event?.startDate
                      ? new Date(event.startDate).toLocaleString()
                      : "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">End Date</p>
                  <p className="text-white mt-1">
                    {event?.endDate
                      ? new Date(event.endDate).toLocaleString()
                      : "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Venue</p>
                  <p className="text-white mt-1">
                    {venue?.name || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="text-white mt-1">
                    {[venue?.address, venue?.city, venue?.state, venue?.country]
                      .filter(Boolean)
                      .join(", ") || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 pt-6">
              <h3 className="text-lg font-semibold text-white mb-5">
                Ticket Information
              </h3>

              <div className="space-y-4">
                {booking.tickets.map((ticket, index) => (
                  <div
                    key={ticket._id || index}
                    className="flex justify-between gap-4 bg-[#0B1020] rounded-xl p-4"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {ticket.ticketType?.name || ticket.name}
                      </p>

                      <p className="text-gray-400 text-sm mt-1">
                        Quantity: {ticket.quantity}
                      </p>

                      <p className="text-gray-500 text-sm mt-1">
                        ₹{ticket.price} per ticket
                      </p>
                    </div>

                    <p className="text-white font-semibold">
                      ₹{ticket.subtotal}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 pt-6">
              <h3 className="text-lg font-semibold text-white mb-5">
                Payment Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Payment Status</span>
                  <span className="text-white capitalize">
                    {booking.paymentStatus}
                  </span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Booking Date</span>
                  <span className="text-white">
                    {booking.bookedAt
                      ? new Date(booking.bookedAt).toLocaleString()
                      : "Not available"}
                  </span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-4 mt-4">
                  <span className="text-white font-semibold">
                    Total Amount
                  </span>

                  <span className="text-purple-400 text-xl font-bold">
                    ₹{booking.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;
