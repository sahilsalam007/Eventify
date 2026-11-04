
import FeaturedEvents from "../features/events/components/FeaturedEvents";
import EventCategories from "../features/events/components/EventCategories";
import AboutSection from "../components/common/AboutSection";
import Testimonials from "../components/common/Testimonials";
import CTASection from "../components/common/CTASection";
import Footer from "../components/layout/Footer";
import {
  CalendarDays,
  MapPin,
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 lg:px-20">
        <h1 className="text-2xl font-bold tracking-wide">
          Event<span className="text-purple-500">ify.</span>
        </h1>

        <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
          <a href="/" className="text-white">Home</a>
          <a href="#events" className="hover:text-purple-400">Explore Events</a>
          <a href="#about" className="hover:text-purple-400">About</a>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-lg px-4 py-2 text-sm text-gray-300 hover:text-white sm:block">
            Login
          </button>

          <button className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold hover:bg-purple-700">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 pb-20 pt-20 text-center lg:px-20">
        <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
          <Sparkles size={16} />
          Discover experiences that matter
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
          Every Event Has a Story.
          <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Make Yours Unforgettable.
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
          Discover amazing events, connect with people, and create
          unforgettable experiences. Your next great moment starts here.
        </p>

        {/* Search Bar */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-[#141b31] p-3 shadow-2xl shadow-purple-950/30 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search className="text-purple-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full bg-transparent py-3 text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-1 items-center gap-3 border-t border-white/10 px-3 sm:border-l sm:border-t-0">
            <MapPin className="text-purple-400" size={20} />
            <input
              type="text"
              placeholder="Location"
              className="w-full bg-transparent py-3 text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-7 py-3 font-semibold hover:bg-purple-700">
            Search <ArrowRight size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-[#0b1020] hover:bg-gray-200">
            Explore Events <CalendarDays size={18} />
          </button>

          <button className="rounded-xl border border-white/15 px-7 py-3.5 font-semibold text-white hover:border-purple-400 hover:text-purple-300">
            Create an Event
          </button>
        </div>
      </main>
      <FeaturedEvents />
      <EventCategories />
      <AboutSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}

export default Home;