import { ArrowRight, Sparkles } from "lucide-react";
import { events } from "../data/events";
import EventCard from "./EventCard";

function FeaturedEvents() {
  return (
    <section id="events" className="px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
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

        {/* Event Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeaturedEvents;