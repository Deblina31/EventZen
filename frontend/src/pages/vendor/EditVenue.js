import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EditVenue.css"; 

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState({
    name: "",
    location: "",
    capacity: 0,
  });

  const token = localStorage.getItem("token");

  const fetchVenue = async () => {
    try {
      const res = await axios.get(`http://localhost:5193/venues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVenue({
        name: res.data.name || res.data.Name || "",
        location: res.data.location || res.data.Location || "",
        capacity: res.data.capacity || res.data.Capacity || 0,
      });
    } catch (err) {
      console.error("Error fetching venue", err);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5193/venues/${id}`, venue, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Venue updated successfully");
      navigate("/vendor/my-venues");
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update venue");
    }
  };

  return (
    <div className="edit-venue-container">
      <div className="edit-card">
        <h2>Edit Venue Details</h2>
        <p className="subtitle">Update your venue information below</p>

        <div className="form-group">
          <label>Venue Name</label>
          <input
            type="text"
            value={venue.name}
            onChange={(e) => setVenue({ ...venue, name: e.target.value })}
            placeholder="Enter venue name"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={venue.location}
            onChange={(e) => setVenue({ ...venue, location: e.target.value })}
            placeholder="Enter location"
          />
        </div>

        <div className="form-group">
          <label>Capacity (People)</label>
          <input
            type="number"
            value={venue.capacity}
            onChange={(e) => setVenue({ ...venue, capacity: parseInt(e.target.value) || 0 })}
            placeholder="Max capacity"
          />
        </div>

        <div className="edit-actions">
          <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
          <button className="update-btn" onClick={handleUpdate}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditVenue;