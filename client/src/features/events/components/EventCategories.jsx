import {
  Music2,
  Laptop,
  Utensils,
  BriefcaseBusiness,
  Trophy,
  Palette,
} from "lucide-react";

const categories = [
  { name: "Music", count: "120+ Events", icon: Music2 },
  { name: "Technology", count: "85+ Events", icon: Laptop },
  { name: "Food & Drinks", count: "60+ Events", icon: Utensils },
  { name: "Business", count: "45+ Events", icon: BriefcaseBusiness },
  { name: "Sports", count: "70+ Events", icon: Trophy },
  { name: "Arts & Culture", count: "50+ Events", icon: Palette },
];

function EventCategories() {
  return (
    <section className="px-6 py-16 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold tracking-wider text-purple-400">
            EXPLORE BY INTEREST
          </p>

          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Find Events That Match Your Vibe
          </h2>

          <p className="mt-3 text-gray-400">
            Explore experiences across different categories.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.name}
                className="group rounded-2xl border border-white/10 bg-[#141b31] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-purple-600/10"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 transition group-hover:bg-purple-600 group-hover:text-white">
                  <Icon size={24} />
                </div>

                <h3 className="font-semibold text-white">
                  {category.name}
                </h3>

                <p className="mt-2 text-xs text-gray-400">
                  {category.count}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default EventCategories;