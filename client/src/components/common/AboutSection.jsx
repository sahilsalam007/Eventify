import {
  Ticket,
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Ticket,
    title: "Easy Ticket Booking",
    description:
      "Discover events and book your tickets in just a few simple steps.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Enjoy a safe and reliable booking experience with secure payments.",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description:
      "Stay informed with instant updates about your bookings and events.",
  },
  {
    icon: Users,
    title: "For Everyone",
    description:
      "A simple platform for attendees, event organizers, and communities.",
  },
];

function AboutSection() {
  return (
    <section id="about" className="px-6 py-20 lg:px-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold tracking-wider text-purple-400">
            WHY CHOOSE EVENTIFY
          </p>

          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            Everything You Need to Create Unforgettable Experiences
          </h2>

          <p className="mt-5 max-w-xl leading-7 text-gray-400">
            Eventify brings event discovery, ticket booking, and event
            management together in one place. Whether you're attending
            an event or organizing one, we make the experience simple.
          </p>

          <div className="mt-8 flex flex-wrap gap-8">
            <div>
              <h3 className="text-3xl font-bold text-purple-400">500+</h3>
              <p className="mt-1 text-sm text-gray-400">Events planned</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-purple-400">10K+</h3>
              <p className="mt-1 text-sm text-gray-400">Happy attendees</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-purple-400">100+</h3>
              <p className="mt-1 text-sm text-gray-400">Organizers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-[#141b31] p-6 transition hover:-translate-y-1 hover:border-purple-500/50"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <Icon size={24} />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;