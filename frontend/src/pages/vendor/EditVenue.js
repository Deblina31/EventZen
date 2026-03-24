import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState({
    name: "",
    location: "",
  });

  const token = localStorage.getItem("token");

  // 🔹 Fetch venue by ID
  const fetchVenue = async () => {
    try {
      const res = await axios.get(`http://localhost:5193/venues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVenue(res.data);
    } catch (err) {
      console.error("Error fetching venue", err);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, []);

  // 🔹 Update venue
  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5193/venues/${id}`,
        venue,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Venue updated successfully");
      navigate("/vendor/dashboard"); // go back
    } catch (err) {
      console.error("Update error", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Venue</h2>

      <input
        type="text"
        value={venue.name}
        onChange={(e) =>
          setVenue({ ...venue, name: e.target.value })
        }
        placeholder="Venue Name"
      />

      <br /><br />

      <input
        type="text"
        value={venue.location}
        onChange={(e) =>
          setVenue({ ...venue, location: e.target.value })
        }
        placeholder="Location"
      />

      <br /><br />

      <button onClick={handleUpdate}>
        Update
      </button>
    </div>
  );
};

export default EditVenue;