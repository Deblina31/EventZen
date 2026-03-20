import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getAllEvents } from "../../services/eventService";
import { createBooking } from "../../services/bookingService";

const UserDashboard = () => {
  const handleBooking = async (eventId) => {
    try {
      await createBooking(eventId);
      alert("Booking successful 🎉");
    } catch (err) {
      console.error(err);
      alert("Booking failed ❌");
    }
  };
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      console.log("EVENTS 👉", res.data);
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px" }}>
        <h2>Event Feed 🎉</h2>

        {events.length === 0 ? (
          <p>No events found 😢</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              style={{
                border: "1px solid #ccc",
                margin: "12px",
                padding: "12px",
                borderRadius: "8px",
                width: "300px",
              }}
            >
              <h3>{event.title}</h3>
              <p>Description: {event.description}</p>
              <p>
                📅{" "}
                {event.eventDate
                  ? new Date(event.eventDate).toLocaleString()
                  : "No date"}
              </p>

              <button onClick={() => handleBooking(event.id)}>
                Book Now 🎟️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
