import { useEffect, useState } from "react";
import { getAllEvents, getEventsByCategory } from "../../services/eventService";
import { getAllVenues } from "../../services/venueService";
import { createBooking } from "../../services/bookingService";
import { toast } from "react-toastify";

const CATEGORIES = ["ALL", "SOCIAL", "CORPORATE", "SPORTS", "TECH"];

const UserDashboard = () => {
  const [events,   setEvents]   = useState([]);
  const [venues,   setVenues]   = useState([]);
  const [category, setCategory] = useState("ALL");
  const [loading,  setLoading]  = useState(false);
  const [booking,  setBooking]  = useState(null); // id currently being booked

  useEffect(() => { fetchData(); }, [category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, vnRes] = await Promise.all([
        category === "ALL" ? getAllEvents() : getEventsByCategory(category),
        getAllVenues()
      ]);
      setEvents(Array.isArray(evRes.data) ? evRes.data : []);
      setVenues(Array.isArray(vnRes.data) ? vnRes.data : []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (eventId) => {
    setBooking(eventId);
    try {
      await createBooking({ eventId, quantity: 1 });
      toast.success("Booking confirmed!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Booking failed");
    } finally {
      setBooking(null);
    }
  };

  const getVenue = (venueId) =>
    venues.find(v => (v.id || v.Id)?.toString() === venueId?.toString());

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Browse Events</h1>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`btn btn-sm ${category === c ? "btn-primary" : "btn-outline"}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-muted">Loading events...</p>}

      {!loading && events.length === 0 && (
        <div className="empty-state"><p>No events found for this category.</p></div>
      )}

      <div className="grid-2">
        {events.map(event => {
          const venue = getVenue(event.venueId);
          return (
            <div className="card" key={event.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{event.name || event.title}</h3>
                {event.category && (
                  <span className="badge badge-info">{event.category}</span>
                )}
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--gray-600)", marginBottom: "0.75rem" }}>
                {event.description || "No description"}
              </p>

              <div style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginBottom: "1rem" }}>
                <p>📍 {venue ? `${venue.name || venue.Name} — ${venue.city || venue.City || ""}` : "Venue TBD"}</p>
                <p>🗓 {event.startDateTime ? new Date(event.startDateTime).toLocaleString() : "Date TBD"}</p>
                {event.totalBudget && <p>💰 Budget: ₹{event.totalBudget?.toLocaleString()}</p>}
              </div>

              <button
                className="btn btn-primary btn-sm w-full"
                onClick={() => handleBook(event.id)}
                disabled={booking === event.id}
              >
                {booking === event.id ? "Booking..." : "Book Now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;