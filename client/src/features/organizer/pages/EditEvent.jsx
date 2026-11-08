import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "../../../services/api";

function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    eventType: "offline",
    venue: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
    },
    onlineLink: "",
    startDate: "",
    endDate: "",
    coverImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/events/my-events/${eventId}`);

        const event = response.data.event;

        setFormData({
          title: event.title || "",
          description: event.description || "",
          category: event.category || "",
          eventType: event.eventType || "offline",
          venue: {
            name: event.venue?.name || "",
            address: event.venue?.address || "",
            city: event.venue?.city || "",
            state: event.venue?.state || "",
            country: event.venue?.country || "",
          },
          onlineLink: event.onlineLink || "",
          startDate: event.startDate
            ? new Date(event.startDate).toISOString().slice(0, 16)
            : "",
          endDate: event.endDate
            ? new Date(event.endDate).toISOString().slice(0, 16)
            : "",
          coverImage: event.coverImage || "",
        });
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load event details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("venue.")) {
      const venueField = name.split(".")[1];

      setFormData((prev) => ({
        ...prev,
        venue: {
          ...prev.venue,
          [venueField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError("End date must be after the start date.");
      return;
    }

    if (formData.eventType === "offline") {
      const { name, address, city, state, country } = formData.venue;

      if (
        !name.trim() ||
        !address.trim() ||
        !city.trim() ||
        !state.trim() ||
        !country.trim()
      ) {
        setError("Please complete all venue details.");
        return;
      }
    }

    if (formData.eventType === "online" && !formData.onlineLink.trim()) {
      setError("Please provide an online meeting link.");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/events/${eventId}`, formData);

      navigate("/organizer/events");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update event. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/organizer/events")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400"
        >
          <ArrowLeft size={17} />
          Back to My Events
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <Save size={25} className="text-purple-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Edit Event</h1>
              <p className="mt-1 text-sm text-gray-400">
                Update your event information.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="py-20 text-center text-purple-400">
            Loading event details...
          </p>
        ) : error && !formData.title ? (
          <div className="rounded-xl bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <section className="rounded-2xl border border-white/10 bg-[#101A35] p-6">
              <h2 className="mb-6 text-xl font-semibold">Basic Information</h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </section>

            {/* Event Type */}
            <section className="rounded-2xl border border-white/10 bg-[#101A35] p-6">
              <h2 className="mb-5 text-xl font-semibold">Event Type</h2>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="radio"
                    name="eventType"
                    value="offline"
                    checked={formData.eventType === "offline"}
                    onChange={handleChange}
                    className="accent-purple-500"
                  />
                  Offline Event
                </label>

                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="radio"
                    name="eventType"
                    value="online"
                    checked={formData.eventType === "online"}
                    onChange={handleChange}
                    className="accent-purple-500"
                  />
                  Online Event
                </label>
              </div>

              {formData.eventType === "offline" ? (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {[
                    ["venue.name", "Venue Name"],
                    ["venue.address", "Street Address"],
                    ["venue.city", "City"],
                    ["venue.state", "State"],
                    ["venue.country", "Country"],
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label className="mb-2 block text-sm text-gray-300">
                        {label}
                      </label>
                      <input
                        type="text"
                        name={name}
                        value={formData.venue[name.split(".")[1]]}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <label className="mb-2 block text-sm text-gray-300">
                    Online Meeting Link
                  </label>
                  <input
                    type="url"
                    name="onlineLink"
                    value={formData.onlineLink}
                    onChange={handleChange}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </section>

            {/* Date and Time */}
            <section className="rounded-2xl border border-white/10 bg-[#101A35] p-6">
              <h2 className="mb-6 text-xl font-semibold">Date and Time</h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Start Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    End Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/organizer/events")}
                className="rounded-xl border border-white/10 px-6 py-3 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-7 py-3 font-semibold hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditEvent;
