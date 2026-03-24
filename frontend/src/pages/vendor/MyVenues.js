
import { useEffect, useState } from "react";
import axios from "axios";

const MyVenues = () => {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    fetchMyVenues();
  }, []);

  const fetchMyVenues = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:5193/venues/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setVenues(res.data);
  };

  return (
    <div>
      <h2>My Venues</h2>

      {venues.map((v) => (
        <div key={v.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>{v.name}</h3>
          <p>{v.location}</p>

          <button onClick={() => window.location.href = `/vendor/edit/${v.id}`}>
            Edit
          </button>

          <button onClick={() => window.location.href = `/vendor/view/${v.id}`}>
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

export default MyVenues;