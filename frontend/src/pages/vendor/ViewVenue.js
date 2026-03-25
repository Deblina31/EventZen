import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ViewVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const res = await axios.get(`http://localhost:5193/venues/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Data received from .NET:", res.data);
        setVenue(res.data);
      } catch (err) {
        console.error("Error fetching venue:", err);
        setError("Could not load venue details.");
      }
    };

    if (id) {
      fetchVenue();
    }
  }, [id]);

  if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  if (!venue) return <p>Loading venue details...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
        ← Back
      </button>
    
      <h1>{venue.name || venue.Name}</h1>
      
      <div style={{ borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <p><strong>Location:</strong> {venue.location || venue.Location}</p>
        {venue.capacity && (
          <p><strong>Capacity:</strong> {venue.capacity || venue.Capacity} people</p>
        )}
      </div>
    </div>
  );
};

export default ViewVenue;