import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom"; 
import { getAllEvents, deleteEvent } from "../../services/eventService";
import { getAllVenues, deleteVenue } from "../../services/venueService";
import { getAllBookings } from "../../services/bookingService";
import { API } from "../../constants/api";
import { getToken } from "../../utils/jwt";
import axios from "axios";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-toastify";

const TABS = ["Overview", "Users", "Events", "Venues", "Bookings"];

const AdminDashboard = () => {
  const location = useLocation();

  const getTabFromPath = (path) => {
    if (path.includes("/users"))    return "Users";
    if (path.includes("/events"))   return "Events";
    if (path.includes("/venues"))   return "Venues";
    if (path.includes("/bookings")) return "Bookings";
    return "Overview";
  };

  const [tab, setTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const headers = { Authorization: `Bearer ${getToken()}` };

  const fetchAll = useCallback(async () => {
    try {
      const [uRes, eRes, vRes, bRes] = await Promise.allSettled([
        axios.get(`${API.ADMIN}/users?size=100`, { headers }),
        getAllEvents(),
        getAllVenues(),
        getAllBookings(),
      ]);

      const extract = (res, key) => {
        if (res.status !== "fulfilled") return [];
        const d = res.value.data;
        return Array.isArray(d) ? d : (d?.[key] || d?.content || []);
      };

      setUsers(extract(uRes, "users"));
      setEvents(extract(eRes));
      setVenues(extract(vRes));
      setBookings(extract(bRes));
    } catch (err) {
      toast.error("Failed to load dashboard data");
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API.ADMIN}/users/${id}`, { headers });
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success("Event removed");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm("Delete this venue?")) return;
    try {
      await deleteVenue(id);
      setVenues(prev => prev.filter(v => (v.id || v.Id) !== id));
      toast.success("Venue removed");
    } catch {
      toast.error("Failed to delete venue");
    }
  };

  const filteredUsers = filter === "ALL" ? users : users.filter(u => u.role === filter);

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="grid-4" style={{ marginBottom: "2rem" }}>
        {[
          { label: "Users",    value: users.length,    cls: "stat-blue" },
          { label: "Events",   value: events.length,   cls: "stat-green" },
          { label: "Venues",   value: venues.length,   cls: "stat-amber" },
          { label: "Bookings", value: bookings.length, cls: "stat-red" },
        ].map(s => (
          <div className={`stat-card ${s.cls}`} key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--gray-200)", paddingBottom: "0.75rem" }}>
        {TABS.map(t => (
          <button 
            key={t} 
            className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-outline"}`} 
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Users" && (
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
            <h2 className="section-title" style={{ margin: 0 }}>User Management</h2>
            <select className="form-select" style={{ width: "auto" }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="ALL">All Roles</option>
              <option value="USER">Users</option>
              <option value="VENDOR">Vendors</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email || "—"}</td>
                    <td><span className={`badge ${u.role === "VENDOR" ? "badge-info" : "badge-gray"}`}>{u.role}</span></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Events" && (
        <div className="card">
          <h2 className="section-title">Event Management</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
  <tr><th>Name</th><th>Category</th><th>Start</th><th>End</th><th>Ticket Price</th><th>Action</th></tr>
</thead>
<tbody>
  {events.map(e => (
    <tr key={e.id}>
      <td>{e.name || e.title}</td>
      <td>{e.category ? <span className="badge badge-info">{e.category}</span> : "—"}</td>
      <td>{e.startDateTime ? new Date(e.startDateTime).toLocaleString() : "—"}</td>
      <td>{e.endDateTime   ? new Date(e.endDateTime).toLocaleString()   : "—"}</td>
      <td>{e.ticketPrice > 0 ? `₹${e.ticketPrice}` : "Free"}</td>
      <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(e.id)}>Delete</button></td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Venues" && (
        <div className="card">
          <h2 className="section-title">Venue Management</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
  <tr><th>Name</th><th>City</th><th>Capacity</th><th>Amenities</th><th>Image</th><th>Action</th></tr>
</thead>
<tbody>
  {venues.map(v => (
    <tr key={v.id||v.Id}>
      <td>{v.name||v.Name}</td>
      <td>{v.city||v.City||"—"}</td>
      <td>{v.capacity||v.Capacity}</td>
      <td style={{ maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {v.amenities||v.Amenities||"—"}
      </td>
      <td>
        {(v.imageUrl||v.ImageUrl)
          ? <img src={v.imageUrl||v.ImageUrl} alt="" style={{ width:40, height:30, objectFit:"cover", borderRadius:4 }} />
          : "—"}
      </td>
      <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteVenue(v.id||v.Id)}>Delete</button></td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Bookings" && (
        <div className="card">
          <h2 className="section-title">Booking Management</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
  <tr><th>#</th><th>User</th><th>Event</th><th>Ticket Type</th><th>Qty</th><th>Price</th><th>Status</th><th>Payment</th></tr>
</thead>
<tbody>
  {bookings.map(b => (
    <tr key={b.id}>
      <td>#{b.id}</td>
      <td>{b.userId}</td>
      <td>{b.eventId}</td>
      <td>{b.ticketType || "General"}</td>
      <td>{b.quantity || 1}</td>
      <td>{b.price > 0 ? `₹${Number(b.price).toLocaleString()}` : "Free"}</td>
      <td><StatusBadge status={b.status} /></td>
      <td><StatusBadge status={b.paymentStatus} /></td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Overview" && (
        <div className="grid-2">
          {[
            { title: "Recent Events", items: events.slice(0, 5), render: e => `${e.name || e.title} — ${e.category || ""}` },
            { title: "Recent Bookings", items: bookings.slice(0, 5), render: b => `Booking #${b.id} — ${b.status}` },
          ].map(section => (
            <div className="card" key={section.title}>
              <h3 className="section-title">{section.title}</h3>
              {section.items.length === 0
                ? <p className="text-muted">No data available</p>
                : section.items.map((item, i) => (
                    <p key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.875rem" }}>
                      {section.render(item)}
                    </p>
                  ))
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;