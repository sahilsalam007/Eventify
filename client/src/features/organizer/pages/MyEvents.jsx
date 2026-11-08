import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/my-events");
        setEvents(response.data.events || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load your events."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1020] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Link
              to="/organizer/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <p className="text-sm text-purple-400">
              ORGANIZER WORKSPACE
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              My Events
            </h1>

            <p className="mt-2 text-gray-400">
              View and manage all your created events.
            </p>
          </div>

          <button
            onClick={() => navigate("/organizer/events/create")}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-purple-400">
            Loading your events...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#101A35] p-12 text-center">
            <CalendarDays
              size={42}
              className="mx-auto text-gray-500"
            />

            <h2 className="mt-5 text-xl font-semibold">
              No events found
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Events you create will appear here.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-gray-400">
              {events.length}{" "}
              {events.length === 1 ? "event" : "events"} found
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#101A35]"
                >
                  {event.coverImage ? (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-[#172344]">
                      <CalendarDays
                        size={45}
                        className="text-purple-400"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs capitalize text-purple-300">
                        {event.status}
                      </span>

                      <span className="text-xs capitalize text-gray-400">
                        {event.eventType}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold">
                      {event.title}
                    </h2>

                    <div className="mt-4 space-y-3 text-sm text-gray-400">
                      <p className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-purple-400"
                        />
                        {event.startDate
                          ? new Date(event.startDate).toLocaleDateString()
                          : "Date unavailable"}
                      </p>

                      {event.eventType === "offline" && (
                        <p className="flex items-center gap-2">
                          <MapPin
                            size={16}
                            className="shrink-0 text-purple-400"
                          />
                          {event.venue?.city ||
                            event.venue?.name ||
                            "Venue unavailable"}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() =>
                          navigate(
                            `/organizer/events/${event._id}/edit`
                          )
                        }
                        className="rounded-lg border border-purple-500/30 px-4 py-2 text-sm font-medium text-purple-400 transition hover:bg-purple-500/10"
                      >
                        Edit Event
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyEvents;