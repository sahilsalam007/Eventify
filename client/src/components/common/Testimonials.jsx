import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Arjun Menon",
    role: "Event Attendee",
    initials: "AM",
    review:
      "Booking tickets through Eventify was incredibly simple. I found an amazing music festival and booked my tickets within minutes.",
  },
  {
    name: "Sneha Thomas",
    role: "Event Organizer",
    initials: "ST",
    review:
      "Managing events has become much easier. Having bookings and attendee information in one place saves so much time.",
  },
  {
    name: "Rahul Nair",
    role: "Tech Enthusiast",
    initials: "RN",
    review:
      "The platform is clean, easy to use, and makes discovering interesting events a great experience.",
  },
];

function Testimonials() {
  return (
    <section className="px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold tracking-wider text-purple-400">
            WHAT PEOPLE SAY
          </p>

          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Experiences That Speak for Themselves
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            See what people think about discovering and managing events
            with Eventify.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-2xl border border-white/10 bg-[#141b31] p-7 transition duration-300 hover:-translate-y-1 hover:border-purple-500/50"
            >
              <div className="mb-5 flex items-center justify-between">
                <Quote size={30} className="text-purple-400" />

                <div className="flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={15} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="min-h-28 leading-7 text-gray-300">
                "{testimonial.review}"
              </p>

              <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600/20 font-semibold text-purple-300">
                  {testimonial.initials}
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    {testimonial.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;