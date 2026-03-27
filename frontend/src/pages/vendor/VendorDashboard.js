import { useEffect, useState } from "react";
import { getMyVenues, createVenue } from "../../services/venueService";
import { getMyEvents, createEvent } from "../../services/eventService";
import { toast } from "react-toastify";
import StatusBadge from "../../components/StatusBadge";

const CATEGORIES = ["SOCIAL", "CORPORATE", "SPORTS", "TECH"];

const VendorDashboard = () => {
  const [venues,  setVenues]  = useState([]);
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [venueForm, setVenueForm] = useState({ name: "", address: "", city: "", state: "", zipCode: "", capacity: "", description: "" });
  const [eventForm, setEventForm] = useState({ name: "", description: "", startDateTime: "", endDateTime: "", venueId: "", category: "SOCIAL", totalBudget: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vRes, eRes] = await Promise.all([getMyVenues(), getMyEvents()]);
      setVenues(Array.isArray(vRes.data) ? vRes.data : []);
      setEvents(Array.isArray(eRes.data) ? eRes.data : []);
    } catch { toast.error("Failed to load data"); }
    finally  { setLoading(false); }
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    try {
      await createVenue({ ...venueForm, capacity: parseInt(venueForm.capacity) });
      toast.success("Venue added!");
      setVenueForm({ name: "", address: "", city: "", state: "", zipCode: "", capacity: "", description: "" });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to add venue"); }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await createEvent({ ...eventForm, venueId: parseInt(eventForm.venueId), totalBudget: parseFloat(eventForm.totalBudget) });
      toast.success("Event created!");
      setEventForm({ name: "", description: "", startDateTime: "", endDateTime: "", venueId: "", category: "SOCIAL", totalBudget: "" });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to create event"); }
  };

  // Stats
  const totalBudget  = events.reduce((s, e) => s + (e.totalBudget || 0), 0);
  const totalSpent   = events.reduce((s, e) => s + (e.currentExpenses || 0), 0);

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Vendor Dashboard</h1>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: "2rem" }}>
        {[
          { label: "My Venues",  value: venues.length,  cls: "stat-blue" },
          { label: "My Events",  value: events.length,  cls: "stat-green" },
          { label: "Total Budget",  value: `₹${totalBudget.toLocaleString()}`, cls: "stat-amber" },
          { label: "Total Spent",   value: `₹${totalSpent.toLocaleString()}`,  cls: "stat-red" },
        ].map(s => (
          <div className={`stat-card ${s.cls}`} key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {loading && <p className="text-muted">Loading...</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Venues section */}
        <div>
          <h2 className="section-title">My Venues</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {venues.length === 0 && <div className="empty-state"><p>No venues yet</p></div>}
            {venues.map(v => (
              <div className="card" key={v.id || v.Id} style={{ padding: "1rem" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{v.name || v.Name}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>{v.city || v.City} · Cap: {v.capacity || v.Capacity}</p>
                  </div>
                  <a href={`/vendor/edit/${v.id || v.Id}`} className="btn btn-outline btn-sm">Edit</a>
                </div>
              </div>
            ))}
          </div>

          {/* Add venue form */}
          <div className="card">
            <h3 className="section-title">Add New Venue</h3>
            <form onSubmit={handleAddVenue}>
              {[
                { label: "Venue Name", name: "name",        type: "text" },
                { label: "Address",    name: "address",     type: "text" },
                { label: "City",       name: "city",        type: "text" },
                { label: "State",      name: "state",       type: "text" },
                { label: "Zip Code",   name: "zipCode",     type: "text" },
                { label: "Capacity",   name: "capacity",    type: "number" },
              ].map(f => (
                <div className="form-group" key={f.name}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} placeholder={f.label}
                    value={venueForm[f.name]}
                    onChange={e => setVenueForm({ ...venueForm, [f.name]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={venueForm.description}
                  onChange={e => setVenueForm({ ...venueForm, description: e.target.value })} />
              </div>
              <button className="btn btn-primary w-full" type="submit">Add Venue</button>
            </form>
          </div>
        </div>

        {/* Events section */}
        <div>
          <h2 className="section-title">My Events</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {events.length === 0 && <div className="empty-state"><p>No events yet</p></div>}
            {events.map(ev => (
              <div className="card" key={ev.id} style={{ padding: "1rem" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: "0.5rem" }}>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{ev.name || ev.title}</p>
                  {ev.category && <span className="badge badge-info">{ev.category}</span>}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>
                  <p>Budget: ₹{(ev.totalBudget || 0).toLocaleString()} · Spent: ₹{(ev.currentExpenses || 0).toLocaleString()}</p>
                  <p style={{ color: ev.remainingBudget < 0 ? "var(--danger)" : "var(--success)" }}>
                    Remaining: ₹{(ev.remainingBudget || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Create event form */}
          <div className="card">
            <h3 className="section-title">Create Event</h3>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input className="form-input" placeholder="Event name" value={eventForm.name}
                  onChange={e => setEventForm({ ...eventForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date & Time</label>
                <input className="form-input" type="datetime-local" value={eventForm.startDateTime}
                  onChange={e => setEventForm({ ...eventForm, startDateTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date & Time</label>
                <input className="form-input" type="datetime-local" value={eventForm.endDateTime}
                  onChange={e => setEventForm({ ...eventForm, endDateTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Venue</label>
                <select className="form-select" value={eventForm.venueId}
                  onChange={e => setEventForm({ ...eventForm, venueId: e.target.value })}>
                  <option value="">Select a venue</option>
                  {venues.map(v => (
                    <option key={v.id || v.Id} value={v.id || v.Id}>
                      {v.name || v.Name} — {v.city || v.City}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={eventForm.category}
                  onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Budget (₹)</label>
                <input className="form-input" type="number" placeholder="0" value={eventForm.totalBudget}
                  onChange={e => setEventForm({ ...eventForm, totalBudget: e.target.value })} />
              </div>
              <button className="btn btn-primary w-full" type="submit">Create Event</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;