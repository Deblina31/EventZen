import { useEffect, useState } from "react";
import axios from "axios";
import "./VendorDashboard.css";

const VendorDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newVenue, setNewVenue] = useState({ name: "", location: "" });
  
  const [newEvent, setNewEvent] = useState({ 
    title: "", 
    venueId: "", 
    totalBudget: "" 
  });

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
    if (!newEvent.venueId || !newEvent.totalBudget) {
      return alert("Please fill in the title, venue, and budget!");
    }
    try {
      await axios.post("http://localhost:8081/events", newEvent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewEvent({ title: "", venueId: "", totalBudget: "" });
      fetchEvents();
    } catch (err) {
      console.error("Add event error", err);
    }
  };

  return (
    <div className="vendor-container">
      <div className="vendor-content">
        <h2>Vendor Dashboard</h2>

        {loading && <p className="loading-text">Loading Data...</p>}

        <div className="dashboard-grid">
          <section className="dashboard-section">
            <h3>Your Venues</h3>
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

         
          <section className="dashboard-section">
            <h3>Your Events</h3>
            <div className="event-list">
              {events.length === 0 ? (
                <p className="empty-text">No events added yet</p>
              ) : (
                events.map((e) => {
                  const actualVenueId = e.venueId || e.venue_id || e.venueID;
                  const matchedVenue = venues.find((v) => (v.id || v.Id)?.toString() === actualVenueId?.toString());

                  return (
                    <div key={e.id} className="event-card">
                      <div className="event-info">
                        <strong>{e.title}</strong>
                        <p className="location-subtext">
                          {matchedVenue ? (matchedVenue.location || matchedVenue.Location) : `ID: ${actualVenueId} (Link Pending)`}
                        </p>
                        
                
                        <div className="event-finances">
                          <div className="finance-row">
                            <span>Budget:</span>
                            <span>Rs{e.totalBudget?.toLocaleString() || 0}</span>
                          </div>
                          <div className="finance-row">
                            <span>Spent:</span>
                            <span className="spent-text">Rs{e.currentExpenses?.toLocaleString() || 0}</span>
                          </div>
                          <hr />
                          <div className={`finance-row total ${e.remainingBudget < 0 ? "negative" : ""}`}>
                            <span>Remaining:</span>
                            <span>Rs{e.remainingBudget?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="add-form">
              <h4>Create Event</h4>
              <input 
                type="text" 
                placeholder="Event Title" 
                value={newEvent.title} 
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} 
                className="input-field" 
              />
              
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

              <input 
                type="number" 
                placeholder="Total Budget (INR)" 
                value={newEvent.totalBudget} 
                onChange={(e) => setNewEvent({ ...newEvent, totalBudget: e.target.value })} 
                className="input-field" 
              />

              <button className="add-btn event-btn" onClick={addEvent}>Add Event</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;