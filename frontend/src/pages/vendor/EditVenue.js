import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVenueById, updateVenue } from "../../services/venueService";
import { toast } from "react-toastify";

const FIELDS = [
  { label: "Venue Name",   name: "name",        type: "text" },
  { label: "Address",      name: "address",     type: "text" },
  { label: "City",         name: "city",        type: "text" },
  { label: "State",        name: "state",       type: "text" },
  { label: "Zip Code",     name: "zipCode",     type: "text" },
  { label: "Capacity",     name: "capacity",    type: "number" },
  { label: "Image URL",    name: "imageUrl",    type: "text" },
];

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue,   setVenue]   = useState({ name: "", address: "", city: "", state: "", zipCode: "", capacity: 0, description: "", amenities: "", imageUrl: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVenueById(id)
      .then(res => setVenue({
        name:        res.data.name        || res.data.Name        || "",
        address:     res.data.address     || res.data.Address     || "",
        city:        res.data.city        || res.data.City        || "",
        state:       res.data.state       || res.data.State       || "",
        zipCode:     res.data.zipCode     || res.data.ZipCode     || "",
        capacity:    res.data.capacity    || res.data.Capacity    || 0,
        description: res.data.description || res.data.Description || "",
        amenities:   res.data.amenities   || res.data.Amenities   || "",
        imageUrl:    res.data.imageUrl    || res.data.ImageUrl    || "",
      }))
      .catch(() => toast.error("Failed to load venue"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateVenue(id, { ...venue, capacity: parseInt(venue.capacity) });
      toast.success("Venue updated!");
      navigate("/vendor/my-venues");
    } catch { toast.error("Update failed"); }
    finally  { setLoading(false); }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: 600 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>
      <div className="card">
        <h2 className="page-title">Edit Venue</h2>
        <form onSubmit={handleSubmit}>
          {FIELDS.map(f => (
            <div className="form-group" key={f.name}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" type={f.type} value={venue[f.name]}
                onChange={e => setVenue({ ...venue, [f.name]: e.target.value })} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Amenities</label>
            <input className="form-input" type="text" placeholder="WiFi, Parking, AC..." value={venue.amenities}
              onChange={e => setVenue({ ...venue, amenities: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={venue.description}
              onChange={e => setVenue({ ...venue, description: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVenue;