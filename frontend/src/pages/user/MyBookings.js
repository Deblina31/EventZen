import { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
import { getAllEvents } from "../../services/eventService";

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

      // 🔥 Merge booking + event data
      const enriched = bookingRes.data.map((b) => {
        const event = events.find((e) => e.id === b.eventId);
        return { ...b, event };
      });

      console.log("ENRICHED BOOKINGS 👉", enriched);
      setBookings(enriched);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Bookings 🎟️</h2>

      {bookings.length === 0 ? (
        <p>No bookings yet 😢</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b.id}
            style={{
              border: "1px solid #ccc",
              margin: "12px",
              padding: "12px",
              borderRadius: "8px",
              width: "300px",
            }}
          >
            <h3>{b.event?.title || "Event not found"}</h3>
            <p>{b.event?.description}</p>

            <p>
              📅{" "}
              {b.event?.eventDate
                ? new Date(b.event.eventDate).toLocaleString()
                : "No date"}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;