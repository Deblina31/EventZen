import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../../services/bookingService";
import { getAllEvents } from "../../services/eventService";
import { submitFeedback, getFeedbackByEvent } from "../../services/feedbackService";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-toastify";

// ── Star Rating ───────────────────────────────────────────
const StarRating = ({ rating, onRate }) => (
  <div style={{ display:"flex", gap:"0.25rem" }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => onRate(n)}
        style={{ fontSize:"1.75rem", background:"none", border:"none",
          cursor:"pointer", padding:0,
          color: n <= rating ? "#f59e0b" : "#d1d5db",
          transition:"color 0.15s" }}>
        ★
      </button>
    ))}
  </div>
);

// ── Feedback Modal ────────────────────────────────────────
const FeedbackModal = ({ booking, onClose, onSubmitted }) => {
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [charErr, setCharErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment && comment.trim().length > 0 && comment.trim().length < 10) {
      setCharErr("Comment must be at least 10 characters or leave it blank");
      return;
    }
    setCharErr("");
    setLoading(true);
    try {
      await submitFeedback({
        eventId: booking.eventId,
        rating,
        comment: comment.trim() || undefined
      });
      toast.success("✅ Feedback submitted! Thank you.");
      onSubmitted(booking.eventId);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.[0]?.msg
        || "Failed to submit feedback";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div className="card" style={{ width:420, maxWidth:"95vw", padding:"2rem" }}>

        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:"1rem" }}>
          <h3 style={{ fontWeight:600 }}>Rate Your Experience</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize:"0.875rem", color:"var(--gray-600)", marginBottom:"1.25rem" }}>
          {booking.event?.name || booking.event?.title || "Event"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Rating *</label>
            <StarRating rating={rating} onRate={setRating} />
            <p style={{ fontSize:"0.75rem", color:"var(--gray-400)", marginTop:"0.25rem" }}>
              {["","Poor","Fair","Good","Very Good","Excellent"][rating]}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Comment
              <span style={{ color:"var(--gray-400)", fontSize:"0.75rem",
                marginLeft:"0.5rem" }}>
                (optional, min 10 chars)
              </span>
            </label>
            <textarea className="form-input" rows={4} value={comment}
              onChange={e => { setComment(e.target.value); setCharErr(""); }}
              placeholder="Share what you liked or what could be improved..."
              style={{ resize:"vertical" }} />
            <div style={{ display:"flex", justifyContent:"space-between",
              fontSize:"0.75rem", marginTop:"0.25rem" }}>
              {charErr
                ? <span className="text-danger">{charErr}</span>
                : <span />}
              <span style={{ color: comment.length < 10 && comment.length > 0
                ? "var(--danger)" : "var(--gray-400)" }}>
                {comment.length} chars
              </span>
            </div>
          </div>

          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary"
              style={{ flex:1 }} disabled={loading}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────
const MyBookings = () => {
  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(null);
  // track which eventIds this user already gave feedback for
  const [feedbackGiven, setFeedbackGiven] = useState(new Set());

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [bRes, eRes] = await Promise.all([
        getMyBookings(),
        getAllEvents()
      ]);

      const events   = Array.isArray(eRes.data) ? eRes.data : [];
      const enriched = bRes.data.map(b => ({
        ...b,
        event: events.find(e => e.id === b.eventId)
      }));
      setBookings(enriched);

      // check which confirmed events already have feedback from this user
      const confirmedIds = [...new Set(
        enriched.filter(b => b.status === "confirmed").map(b => b.eventId)
      )];

      const feedbackResults = await Promise.allSettled(
        confirmedIds.map(id => getFeedbackByEvent(id))
      );

      // get userId from token
      const token   = localStorage.getItem("token");
      const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
      const myId    = payload.userId;

      const alreadyGiven = new Set();
      feedbackResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          const feedbacks = result.value.data;
          if (feedbacks.some(f => f.attendeeId === myId)) {
            alreadyGiven.add(confirmedIds[idx]);
          }
        }
      });
      setFeedbackGiven(alreadyGiven);

    } catch { toast.error("Failed to load bookings"); }
    finally  { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b)
      );
    } catch { toast.error("Failed to cancel"); }
  };

  // called after successful feedback submission
  const handleFeedbackSubmitted = (eventId) => {
    setFeedbackGiven(prev => new Set([...prev, eventId]));
  };

  const statusColor = {
    confirmed: "var(--success)",
    pending:   "var(--warning)",
    cancelled: "var(--danger)",
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
          <div className="card" key={b.id}
            style={{ borderLeft:`3px solid ${statusColor[b.status] || "var(--gray-200)"}` }}>

            {/* Title row */}
            <div className="flex items-center justify-between"
              style={{ marginBottom:"0.75rem" }}>
              <h3 style={{ fontSize:"1rem", fontWeight:600 }}>
                {b.event?.name || b.event?.title || "Event"}
              </h3>
              <StatusBadge status={b.status} />
            </div>

            {/* Details */}
            <div style={{ fontSize:"0.82rem", color:"var(--gray-600)",
              marginBottom:"1rem", display:"flex", flexDirection:"column", gap:"0.3rem" }}>
              <p>🗓 {b.event?.startDateTime
                ? new Date(b.event.startDateTime).toLocaleString()
                : "Date TBD"}</p>
              <p>🎟 {b.ticketType || "General"} ticket</p>
              <p>🔢 Qty: {b.quantity || 1}</p>
              <p>💰 {parseFloat(b.price) > 0
                ? `₹${parseFloat(b.price).toLocaleString()}`
                : "Free"}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <span>💳</span>
                <StatusBadge status={b.paymentStatus || "pending"} />
              </div>
              <p>📅 Booked: {new Date(b.registrationDate || b.createdAt)
                .toLocaleDateString()}</p>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              {b.status !== "cancelled" && (
                <button className="btn btn-danger btn-sm"
                  onClick={() => handleCancel(b.id)}>
                  Cancel
                </button>
              )}

              {b.status === "confirmed" && !feedbackGiven.has(b.eventId) && (
                <button className="btn btn-outline btn-sm"
                  onClick={() => setFeedbackModal(b)}>
                  ⭐ Rate Event
                </button>
              )}

              {b.status === "confirmed" && feedbackGiven.has(b.eventId) && (
                <span style={{ fontSize:"0.78rem", color:"var(--success)",
                  display:"flex", alignItems:"center", gap:"0.25rem" }}>
                  ✅ Feedback given
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {feedbackModal && (
        <FeedbackModal
          booking={feedbackModal}
          onClose={() => setFeedbackModal(null)}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
};

export default MyBookings;