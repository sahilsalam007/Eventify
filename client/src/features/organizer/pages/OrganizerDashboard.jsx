import { useEffect, useState } from "react";
import {
  CalendarDays,
  Ticket,
  CheckCircle,
  Clock,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

function OrganizerDashboard() {
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
          error.response?.data?.message || "Unable to load your events.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const now = new Date();

  const publishedEvents = events.filter(
    (event) => event.status === "published",
  );

  const draftEvents = events.filter((event) => event.status === "draft");

  const upcomingEvents = events.filter(
    (event) => event.status === "published" && new Date(event.startDate) > now,
  );

  const stats = [
    {
      title: "Total Events",
      value: events.length,
      icon: CalendarDays,
      color: "text-purple-400",
      background: "bg-purple-500/10",
    },
    {
      title: "Published Events",
      value: publishedEvents.length,
      icon: CheckCircle,
      color: "text-green-400",
      background: "bg-green-500/10",
    },
    {
      title: "Draft Events",
      value: draftEvents.length,
      icon: Ticket,
      color: "text-blue-400",
      background: "bg-blue-500/10",
    },
    {
      title: "Upcoming Events",
      value: upcomingEvents.length,
      icon: Clock,
      color: "text-yellow-400",
      background: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1020] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-purple-400">ORGANIZER WORKSPACE</p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 text-gray-400">
              Manage your events and track their performance.
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
            Loading dashboard...
          </div>
        ) : error ? (
          <p className="mt-10 rounded-xl bg-red-500/10 p-5 text-red-400">
            {error}
          </p>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-white/10 bg-[#101A35] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">{stat.title}</p>

                      <div className={`rounded-xl p-3 ${stat.background}`}>
                        <Icon className={stat.color} size={21} />
                      </div>
                    </div>

                    <h2 className="mt-5 text-3xl font-bold">{stat.value}</h2>
                  </div>
                );
              })}
            </div>

            <div className="mt-12">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Recent Events</h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Your recently created events.
                  </p>
                </div>

                <Link
                  to="/organizer/events"
                  className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  View All <ArrowUpRight size={16} />
                </Link>
              </div>

              {events.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#101A35] p-10 text-center">
                  <CalendarDays size={40} className="mx-auto text-gray-500" />

                  <h3 className="mt-4 text-lg font-semibold">
                    No events created yet
                  </h3>

                  <p className="mt-2 text-sm text-gray-400">
                    Your events will appear here once you create them.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div
                      key={event._id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#101A35] p-5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h3 className="font-semibold text-white">
                          {event.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-400">
                          {event.startDate
                            ? new Date(event.startDate).toLocaleDateString()
                            : "Date unavailable"}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-purple-500/10 px-3 py-1 text-xs capitalize text-purple-300">
                        {event.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrganizerDashboard;
