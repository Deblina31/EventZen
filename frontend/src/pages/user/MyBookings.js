import { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
import { getAllEvents } from "../../services/eventService";
import "./MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const bookingRes = await getMyBookings();
      const eventRes = await getAllEvents();

      const events = eventRes.data;

      const enriched = bookingRes.data.map((b) => {
        const event = events.find((e) => e.id === b.eventId);
        return { ...b, event };
      });

      setBookings(enriched);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bookings-container">
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p className="empty-text">No bookings yet</p>
      ) : (
        <div className="bookings-grid">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card">
              <h3>{b.event?.title || "Event not found"}</h3>
              <p className="desc">{b.event?.description}</p>

              <p className="date">
                {b.event?.eventDate
                  ? new Date(b.event.eventDate).toLocaleString()
                  : "No date"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;