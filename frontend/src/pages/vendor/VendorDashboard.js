import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";

const VendorDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newVenue, setNewVenue] = useState({ name: "", location: "" });
  const token = localStorage.getItem("token"); // JWT token

  // Fetch vendor's venues
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
}, [fetchVenues]); // now React knows this effect depends on fetchVenues
  // Add new venue
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

  // Delete venue
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
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1 }}>
        <h2>Vendor Dashboard 🏢</h2>
        {loading && <p>Loading venues...</p>}

        <h3>Your Venues</h3>
        {venues.length === 0 && <p>No venues added yet.</p>}
        {venues.map((v) => (
          <div key={v.id} style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
            <strong>{v.name}</strong> – {v.location}
            <button style={{ marginLeft: "10px" }} onClick={() => deleteVenue(v.id)}>Delete</button>
          </div>
        ))}

        <h3>Add New Venue</h3>
        <input
          type="text"
          placeholder="Venue Name"
          value={newVenue.name}
          onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          value={newVenue.location}
          onChange={(e) => setNewVenue({ ...newVenue, location: e.target.value })}
          style={{ marginLeft: "10px" }}
        />
        <button onClick={addVenue} style={{ marginLeft: "10px" }}>Add Venue</button>
      </div>
    </div>
  );
};

export default VendorDashboard;