import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyVenues, deleteVenue, getVenueAvailability } from "../../services/venueService";
import { toast } from "react-toastify";

const MyVenues = () => {
  const navigate = useNavigate();
  const [venues,  setVenues]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchVenues(); }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await getMyVenues();
      setVenues(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to load venues"); }
    finally  { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this venue?")) return;
    try {
      await deleteVenue(id);
      toast.success("Venue deleted");
      setVenues(prev => prev.filter(v => (v.id || v.Id) !== id));
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title" style={{ margin: 0 }}>My Venues</h1>
        <button className="btn btn-primary" onClick={() => navigate("/vendor/dashboard")}>+ Add Venue</button>
      </div>

      {loading && <p className="text-muted">Loading...</p>}
      {!loading && venues.length === 0 && <div className="empty-state"><p>No venues yet. Add one from your dashboard.</p></div>}

      <div className="grid-2">
        {venues.map(v => (
          <div className="card" key={v.id || v.Id}>
            <div style={{ marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{v.name || v.Name}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>
                {[v.address || v.Address, v.city || v.City, v.state || v.State].filter(Boolean).join(", ")}
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>
                Capacity: {v.capacity || v.Capacity}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate(`/vendor/view/${v.id || v.Id}`)}>View</button>
              <button className="btn btn-primary btn-sm"  onClick={() => navigate(`/vendor/edit/${v.id || v.Id}`)}>Edit</button>
              <button className="btn btn-danger btn-sm"   onClick={() => handleDelete(v.id || v.Id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyVenues;