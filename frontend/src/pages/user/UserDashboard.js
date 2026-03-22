import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getAllEvents } from "../../services/eventService";
import { createBooking } from "../../services/bookingService";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [events, setEvents] = useState([]);

  const handleBooking = async (eventId) => {
    try {
      await createBooking(eventId);
      alert("Booking successful");
    } catch (err) {
      alert("Booking failed");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <h2>Event Feed</h2>

        {events.length === 0 ? (
          <p className="empty-text">No events found</p>
        ) : (
          <div className="event-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <h3>{event.title}</h3>
                <p className="desc">{event.description}</p>
                <p className="date">
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleString()
                    : "No date"}
                </p>

                <button
                  className="book-btn"
                  onClick={() => handleBooking(event.id)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;