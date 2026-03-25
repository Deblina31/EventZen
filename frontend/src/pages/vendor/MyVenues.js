import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyVenues.css"; 

const MyVenues = () => {
  const [venues, setVenues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyVenues();
  }, []);

  const fetchMyVenues = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5193/venues/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVenues(res.data);
    } catch (err) {
      console.error("Error fetching venues", err);
    }
  };

  return (
    <div className="venues-container">
      <header className="venues-header">
        <h2>My Venues</h2>
      </header>

      <div className="venues-grid">
        {venues.map((v) => (
          <div key={v.id} className="venue-card">
            <div className="venue-info">
              <h3>{v.name}</h3>
              <p className="location">Location:- {v.location}</p>
            </div>
            
            <div className="venue-actions">
              <button className="view-btn" onClick={() => navigate(`/vendor/view/${v.id}`)}>
                View Details
              </button>
              <button className="edit-btn" onClick={() => navigate(`/vendor/edit/${v.id}`)}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyVenues;