import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react";

function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#141b31] transition duration-300 hover:-translate-y-2 hover:border-purple-500/50">
      {/* Event Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <span className="absolute left-4 top-4 rounded-full border border-purple-400/30 bg-[#0b1020]/80 px-3 py-1 text-xs font-medium text-purple-300 backdrop-blur-md">
          {event.category}
        </span>

        <span className="absolute bottom-4 right-4 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white">
          ₹{event.price}
        </span>
      </div>

      {/* Event Details */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white transition group-hover:text-purple-400">
          {event.title}
        </h3>

        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-purple-400" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-purple-400" />
            <span>{event.location}</span>
          </div>
        </div>

        <button className="mt-6 flex w-full items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-purple-500 hover:bg-purple-600">
          View Details
          <ArrowUpRight size={17} />
        </button>
      </div>
    </article>
  );
}

export default EventCard;