
import { useEffect, useState } from "react";
import api from "../../../services/api";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get("/tickets/my-tickets");
        setTickets(response.data.tickets);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load your tickets."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1020] flex items-center justify-center">
        <p className="text-purple-400 text-lg">Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          My Tickets
        </h1>

        <p className="text-gray-400 mb-10">
          Your purchased event tickets and QR codes.
        </p>

        {error && (
          <p className="text-red-400 bg-red-400/10 p-4 rounded-lg">
            {error}
          </p>
        )}

        {!error && tickets.length === 0 && (
          <div className="bg-[#101A35] border border-white/10 rounded-xl p-10 text-center">
            <h2 className="text-xl text-white font-semibold mb-2">
              No tickets yet
            </h2>

            <p className="text-gray-400">
              Your purchased tickets will appear here.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-[#101A35] border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {ticket.event?.title || "Event"}
                    </h2>

                    <p className="text-gray-400 text-sm mt-1">
                      {ticket.ticketType?.name || "Ticket"}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      ticket.status === "valid"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <p>
                    <span className="text-gray-300">Ticket Reference:</span>{" "}
                    {ticket.ticketReference}
                  </p>

                  <p>
                    <span className="text-gray-300">Booking Reference:</span>{" "}
                    {ticket.booking?.bookingReference || "N/A"}
                  </p>

                  <p>
                    <span className="text-gray-300">Event Date:</span>{" "}
                    {ticket.event?.startDate
                      ? new Date(ticket.event.startDate).toLocaleString()
                      : "Not available"}
                  </p>

                  <p>
                    <span className="text-gray-300">Venue:</span>{" "}
                    {ticket.event?.venue?.name || "Not available"}
                  </p>
                </div>

                <div className="border-t border-white/10 mt-6 pt-6 flex flex-col items-center">
                  <p className="text-gray-300 text-sm mb-3">
                    Your Entry QR Code
                  </p>

                  {ticket.qrCode && (
                    <img
                      src={ticket.qrCode}
                      alt={`QR code for ${ticket.ticketReference}`}
                      className={`w-48 h-48 bg-white p-2 rounded-lg ${
                        ticket.status !== "valid" ? "opacity-40" : ""
                      }`}
                    />
                  )}

                  <p className="text-gray-500 text-xs mt-3">
                    Show this QR code at the event entrance.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyTickets;
