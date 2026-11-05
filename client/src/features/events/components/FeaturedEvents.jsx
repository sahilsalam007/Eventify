import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import api from "../../../services/api";
import EventCard from "./EventCard";

function FeaturedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events?limit=4");

        const formattedEvents = await Promise.all(
          response.data.events.map(async (event) => {
            try {
              const ticketResponse = await api.get(
                `/events/${event._id}/tickets`,
              );

              const ticketTypes = ticketResponse.data.ticketTypes || [];

              const prices = ticketTypes.map((ticket) => ticket.price);

              return {
                id: event._id,
                title: event.title,
                category: event.category,
                location: event.venue?.city || "Online",
                date: event.startDate,
                image: event.coverImage,
                price: prices.length > 0 ? Math.min(...prices) : null,
              };
            } catch (error) {
              console.error(
                `Failed to fetch tickets for ${event.title}:`,
                error,
              );

              return {
                id: event._id,
                title: event.title,
                category: event.category,
                location: event.venue?.city || "Online",
                date: event.startDate,
                image: event.coverImage,
                price: null,
              };
            }
          }),
        );

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setError("Unable to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section id="events" className="px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-purple-400">
              <Sparkles size={16} />
              HANDPICKED FOR YOU
            </div>

            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Featured Events
            </h2>

            <p className="mt-3 text-gray-400">
              Discover experiences you won't want to miss.
            </p>
          </div>

          <button className="flex w-fit items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300">
            View All Events
            <ArrowRight size={18} />
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-400">Loading events...</p>
        )}

        {error && <p className="text-center text-red-400">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <p className="text-center text-gray-400">
            No events are available right now.
          </p>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedEvents;
