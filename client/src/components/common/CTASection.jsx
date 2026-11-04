import { ArrowRight, CalendarPlus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function CTASection() {
  return (
    <section className="px-6 py-20 lg:px-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/60 via-[#171b3a] to-[#101a35] px-8 py-16 text-center sm:px-14">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <Sparkles size={16} />
            Your Next Experience Starts Here
          </div>

          <h2 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
            Ready to Make Your Next Event Unforgettable?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-300">
            Discover exciting experiences, connect with people, or bring
            your own event idea to life with Eventify.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-7 py-3.5 font-semibold text-white transition hover:bg-purple-500"
            >
              Explore Events
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 font-semibold text-white transition hover:border-purple-400 hover:bg-purple-500/10"
            >
              <CalendarPlus size={18} />
              Become an Organizer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;