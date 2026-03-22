import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import "./VendorDashboard.css";

const VendorDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newVenue, setNewVenue] = useState({ name: "", location: "" });
  const token = localStorage.getItem("token");

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5193/venues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVenues(res.data);
    } catch (err) {
      console.error("Fetch venues error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const addVenue = async () => {
    try {
      await axios.post(
        "http://localhost:5193/venues",
        newVenue,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewVenue({ name: "", location: "" });
      fetchVenues();
    } catch (err) {
      console.error("Add venue error", err);
    }
  };

  const deleteVenue = async (id) => {
    try {
      await axios.delete(`http://localhost:5193/venues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVenues();
    } catch (err) {
      console.error("Delete venue error", err);
    }
  };

  return (
    <div className="vendor-container">
      <Sidebar />
      <div className="vendor-content">
        <h2>Vendor Dashboard</h2>

        {loading && <p className="loading-text">Loading venues...</p>}

        <h3>Your Venues</h3>

        {venues.length === 0 ? (
          <p className="empty-text">No venues added yet</p>
        ) : (
          <div className="venue-list">
            {venues.map((v) => (
              <div key={v.id} className="venue-card">
                <div>
                  <strong>{v.name}</strong>
                  <p className="location">{v.location}</p>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteVenue(v.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <h3>Add New Venue</h3>

        <div className="form-row">
          <input
            type="text"
            placeholder="Venue Name"
            value={newVenue.name}
            onChange={(e) =>
              setNewVenue({ ...newVenue, name: e.target.value })
            }
            className="input-field"
          />

          <input
            type="text"
            placeholder="Location"
            value={newVenue.location}
            onChange={(e) =>
              setNewVenue({ ...newVenue, location: e.target.value })
            }
            className="input-field"
          />

          <button className="add-btn" onClick={addVenue}>
            Add Venue
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;