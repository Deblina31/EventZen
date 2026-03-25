import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import "./VendorDashboard.css";

const VendorDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newVenue, setNewVenue] = useState({ name: "", location: "" });
  const [newEvent, setNewEvent] = useState({ title: "", venueId: "" });

  const token = localStorage.getItem("token");

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5193/venues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.venues || res.data; 
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch venues error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8081/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (err) {
      console.error("Fetch events error", err);
    }
  };

  useEffect(() => {
    fetchVenues();
    fetchEvents();
  }, []);

  const addVenue = async () => {
    try {
      await axios.post("http://localhost:5193/venues", newVenue, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewVenue({ name: "", location: "" });
      fetchVenues();
    } catch (err) {
      console.error("Add venue error", err);
    }
  };

  const addEvent = async () => {
    if (!newEvent.venueId) return alert("Please select a venue!");
    try {
      // LOG: Check what exactly we are sending
      console.log("Adding event with data:", newEvent);
      
      await axios.post("http://localhost:8081/events", newEvent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewEvent({ title: "", venueId: "" });
      fetchEvents();
    } catch (err) {
      console.error("Add event error", err);
    }
  };

  return (
    <div className="vendor-container">
      <Sidebar />
      <div className="vendor-content">
        <h2>Vendor Dashboard</h2>

        {loading && <p className="loading-text">Loading Data...</p>}

        <div className="dashboard-grid">
          {/* VENUES SECTION (.NET) */}
          <section className="dashboard-section">
            <h3>Your Venues (.NET)</h3>
            <div className="venue-list">
              {venues.length === 0 ? (
                <p className="empty-text">No venues added yet</p>
              ) : (
                venues.map((v) => (
                  <div key={v.id || v.Id} className="venue-card">
                    <div>
                      <strong>{v.name || v.Name}</strong>
                      <p className="location">{v.location || v.Location}</p>
                    </div>
                    <button className="edit-btn" onClick={() => window.location.href = `/vendor/edit/${v.id || v.Id}`}>
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="add-form">
              <h4>Add New Venue</h4>
              <input type="text" placeholder="Venue Name" value={newVenue.name} onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })} className="input-field" />
              <input type="text" placeholder="Location" value={newVenue.location} onChange={(e) => setNewVenue({ ...newVenue, location: e.target.value })} className="input-field" />
              <button className="add-btn" onClick={addVenue}>Add Venue</button>
            </div>
          </section>

          {/* EVENTS SECTION (Spring Boot) */}
          <section className="dashboard-section">
            <h3>Your Events (Spring Boot)</h3>
            <div className="event-list">
              {events.length === 0 ? (
                <p className="empty-text">No events added yet</p>
              ) : (
                events.map((e) => {
                  // SMART FINDER: Check all possible key names (venueId, venue_id, venueID)
                  const actualVenueId = e.venueId || e.venue_id || e.venueID;

                  const matchedVenue = venues.find((v) => {
                    const vId = (v.id || v.Id)?.toString();
                    const eVenueId = actualVenueId?.toString();
                    return vId && eVenueId && vId === eVenueId;
                  });

                  return (
                    <div key={e.id} className="event-card">
                      <div className="event-info">
                        <strong>{e.title}</strong>
                        <p className="location-subtext">
                          {matchedVenue 
                            ? (matchedVenue.location || matchedVenue.Location) 
                            : actualVenueId 
                              ? `ID: ${actualVenueId} (Not Found in .NET)` 
                              : "No Venue Linked"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="add-form">
              <h4>Create Event</h4>
              <input type="text" placeholder="Event Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="input-field" />
              <select 
                className="input-field" 
                value={newEvent.venueId} 
                onChange={(e) => setNewEvent({ ...newEvent, venueId: e.target.value })}
              >
                <option value="">Select Venue</option>
                {venues.map(v => (
                  <option key={v.id || v.Id} value={v.id || v.Id}>
                    {v.name || v.Name} — {v.location || v.Location}
                  </option>
                ))}
              </select>
              <button className="add-btn event-btn" onClick={addEvent}>Add Event</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;