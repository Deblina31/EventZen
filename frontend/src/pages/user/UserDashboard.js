import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getAllEvents } from "../../services/eventService";
import { createBooking } from "../../services/bookingService";
import axios from "axios"; // Import axios for the .NET call
import "./UserDashboard.css";

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]); // State to hold .NET venue data

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEvents();
    fetchVenues(); // Fetch venues on component mount
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  // Fetch from your .NET Venue Service
  const fetchVenues = async () => {
    try {
      const res = await axios.get("http://localhost:5193/venues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.venues || res.data;
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching venues", err);
    }
  };

  const handleBooking = async (eventId) => {
    try {
      await createBooking(eventId);
      alert("Booking successful");
    } catch (err) {
      alert("Booking failed");
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
            {events.map((event) => {
              // --- MATCHING LOGIC ---
              const actualVenueId = event.venueId || event.venue_id;
              const matchedVenue = venues.find(
                (v) => (v.id || v.Id)?.toString() === actualVenueId?.toString()
              );

              return (
                <div key={event.id} className="event-card">
                  <h3>{event.title}</h3>
                  <p className="desc">{event.description}</p>
                  
                  {/* VENUE DISPLAY */}
                  <p className="venue-info">
                    📍 {matchedVenue 
                        ? `${matchedVenue.name} — ${matchedVenue.location}` 
                        : "Location TBD"}
                  </p>

                  <p className="date">
                    📅 {event.eventDate
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;