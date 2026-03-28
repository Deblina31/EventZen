import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVenueById, getVenueAvailability } from "../../services/venueService";
import { toast } from "react-toastify";

const ViewVenue = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [venue, setVenue]             = useState(null);
  const [slots, setSlots]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([getVenueById(id), getVenueAvailability(id)])
      .then(([vRes, aRes]) => {
        setVenue(vRes.data);
        setSlots(Array.isArray(aRes.data) ? aRes.data : []);
      })
      .catch(() => toast.error("Failed to load venue"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrapper"><p className="text-muted">Loading...</p></div>;
  if (!venue)  return <div className="page-wrapper"><p className="text-danger">Venue not found.</p></div>;

  const v = venue;

  return (
    <div className="page-wrapper" style={{ maxWidth: 700 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        {(v.imageUrl || v.ImageUrl) && (
          <img
            src={v.imageUrl || v.ImageUrl}
            alt={v.name || v.Name}
            style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 8, marginBottom: "1rem" }}
          />
        )}
        <h2 className="page-title" style={{ marginBottom: "0.5rem" }}>{v.name || v.Name}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.875rem" }}>
          <div><span className="text-muted">Address</span><p>{[v.address || v.Address, v.city || v.City, v.state || v.State, v.zipCode || v.ZipCode].filter(Boolean).join(", ")}</p></div>
          <div><span className="text-muted">Capacity</span><p>{v.capacity || v.Capacity} people</p></div>
          <div><span className="text-muted">Amenities</span><p>{v.amenities || v.Amenities || "—"}</p></div>
          <div><span className="text-muted">Status</span><p>{(v.isActive || v.IsActive) ? "✅ Active" : "❌ Inactive"}</p></div>
        </div>
        {(v.description || v.Description) && (
          <div style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
            <span className="text-muted">Description</span>
            <p>{v.description || v.Description}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="section-title">Available Slots</h3>
        {slots.length === 0 ? (
          <div className="empty-state"><p>No availability slots added yet.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Start</th><th>End</th><th>Available</th></tr>
              </thead>
              <tbody>
                {slots.map(s => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td>{s.startTime}</td>
                    <td>{s.endTime}</td>
                    <td>{s.isAvailable ? <span className="badge badge-success">Yes</span> : <span className="badge badge-danger">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewVenue;