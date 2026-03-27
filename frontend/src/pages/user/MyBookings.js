import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../../services/bookingService";
import { getAllEvents } from "../../services/eventService";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-toastify";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [bRes, eRes] = await Promise.all([getMyBookings(), getAllEvents()]);
      const events = Array.isArray(eRes.data) ? eRes.data : [];
      const enriched = bRes.data.map(b => ({
        ...b,
        event: events.find(e => e.id === b.eventId)
      }));
      setBookings(enriched);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: "cancelled" } : b
      ));
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  return (
    <div className="page-wrapper">
      <h1 className="page-title">My Bookings</h1>

      {loading && <p className="text-muted">Loading...</p>}

      {!loading && bookings.length === 0 && (
        <div className="empty-state"><p>You have no bookings yet.</p></div>
      )}

      <div className="grid-2">
        {bookings.map(b => (
          <div className="card" key={b.id}>
            <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                {b.event?.name || b.event?.title || "Event"}
              </h3>
              <StatusBadge status={b.status} />
            </div>

            <div style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginBottom: "1rem" }}>
              <p>🗓 {b.event?.startDateTime ? new Date(b.event.startDateTime).toLocaleString() : "Date TBD"}</p>
              <p>🎟 Ticket: {b.ticketType || "Standard"} × {b.quantity || 1}</p>
              <p>💳 Payment: <StatusBadge status={b.paymentStatus} /></p>
              <p>📅 Booked: {new Date(b.registrationDate || b.createdAt).toLocaleDateString()}</p>
            </div>

            {b.status !== "cancelled" && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleCancel(b.id)}
              >
                Cancel Booking
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;