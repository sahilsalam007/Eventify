import {
  CalendarDays,
  Globe,
  MessageCircle,
  AtSign,
  Link2,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080d1b] px-6 pt-16 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
                <CalendarDays size={22} className="text-white" />
              </div>

              <span className="text-2xl font-bold text-white">
                Event<span className="text-purple-400">ify</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-400">
              Discover amazing experiences, connect with people, and
              create unforgettable memories with Eventify.
            </p>

            <div className="mt-6 flex gap-3">
              {[Globe, MessageCircle, AtSign, Link2].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label="Social media"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:border-purple-500 hover:bg-purple-600 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white">Quick Links</h3>

            <ul className="mt-5 space-y-3 text-sm text-gray-400">
              <li><Link to="/" className="transition hover:text-purple-400">Home</Link></li>
              <li><Link to="/events" className="transition hover:text-purple-400">Explore Events</Link></li>
              <li><a href="#about" className="transition hover:text-purple-400">About Us</a></li>
              <li><Link to="/register" className="transition hover:text-purple-400">Become an Organizer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Categories</h3>

            <ul className="mt-5 space-y-3 text-sm text-gray-400">
              {["Music", "Technology", "Food & Drinks", "Business", "Sports"].map((item) => (
                <li key={item}>
                  <Link to="/events" className="transition hover:text-purple-400">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Stay Connected</h3>

            <p className="mt-5 text-sm leading-6 text-gray-400">
              Have questions or suggestions? We'd love to hear from you.
            </p>

            <div className="mt-5 space-y-4 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Mail size={17} className="text-purple-400" />
                <span>support@eventify.com</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={17} className="text-purple-400" />
                <span>Kochi, Kerala, India</span>
              </div>
            </div>

            <Link
              to="/events"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300"
            >
              Discover Events
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-center text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Eventify. All rights reserved.</p>
          <p>Made with care for unforgettable experiences.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;