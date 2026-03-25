import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [filterRole, setFilterRole] = useState("ALL");

  // Helper to get fresh headers
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAllData = useCallback(async () => {
    const headers = getHeaders();
    if (!headers.Authorization || headers.Authorization.includes("null")) {
      console.error("No valid token found");
      return;
    }

    const safeFetch = async (url, setter, label) => {
      try {
        const res = await axios.get(url, { headers });
        console.log(`${label} Response:`, res.data);

        // This line handles Spring Page objects (.content), .NET (.venues), and standard arrays
        const rawData = res.data.content || res.data.venues || res.data;
        const finalArray = Array.isArray(rawData) ? rawData : [];
        
        setter(finalArray);
      } catch (err) {
        console.error(`${label} Fetch Error (${err.response?.status}):`, err.response?.data || err.message);
        setter([]);
      }
    };

    // Fire all requests simultaneously
    await Promise.all([
      safeFetch("http://localhost:8080/admin/users?size=100", setUsers, "Users"),
      safeFetch("http://localhost:8081/events", setEvents, "Events"),
      safeFetch("http://localhost:3001/bookings", setBookings, "Bookings"),
      safeFetch("http://localhost:5193/venues", setVenues, "Venues"),
    ]);
  }, []);

  // CRITICAL: This was missing/not firing in your previous snippet
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- DELETE FUNCTIONS ---
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`http://localhost:8080/admin/users/${id}`, { headers: getHeaders() });
      setUsers(prev => prev.filter((u) => u.id !== id));
    } catch (err) { alert("User delete failed"); }
  };

 const handleDeleteEvent = async (id) => {
  if (!window.confirm("Delete this event?")) return;
  try {
    const response = await axios.delete(`http://localhost:8081/events/${id}`, { headers: getHeaders() });
    console.log("Delete Success:", response.data);
    setEvents(prev => prev.filter((e) => e.id !== id));
  } catch (err) {
    // This will now show you exactly what the Java error was!
    const errorMsg = err.response?.data || "Server Error";
    console.error("Delete Failed:", errorMsg);
    alert("Delete failed: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
  }
};

  const handleDeleteVenue = async (id) => {
    if (!window.confirm("Delete this venue?")) return;
    const venueId = id; 
    try {
      await axios.delete(`http://localhost:5193/venues/${venueId}`, { headers: getHeaders() });
      setVenues(prev => prev.filter((v) => (v.id || v.Id) !== venueId));
    } catch (err) { alert("Venue delete failed"); }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await axios.delete(`http://localhost:3001/bookings/${id}`, { headers: getHeaders() });
      setBookings(prev => prev.filter((b) => b.id !== id));
    } catch (err) { alert("Booking delete failed"); }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole === "ALL") return true;
    return u.role === filterRole;
  });

  return (
    <div className="admin-full-wrapper">
      <div className="admin-main-content">
        
        <header className="admin-header">
          <div className="header-left">
            <h1>Admin Control Center</h1>
            <p className="subtitle">System-wide Management</p>
          </div>
          <button className="refresh-btn" onClick={fetchAllData}>🔄 Refresh System Data</button>
        </header>

        <div className="stats-grid">
          <div className="stat-card blue"><h3>{users.length}</h3><p>Users</p></div>
          <div className="stat-card purple"><h3>{events.length}</h3><p>Events</p></div>
          <div className="stat-card green"><h3>{bookings.length}</h3><p>Bookings</p></div>
          <div className="stat-card orange"><h3>{venues.length}</h3><p>Venues</p></div>
        </div>

        <div className="management-grid">
          
          {/* USER TABLE */}
          <div className="table-container">
            <div className="table-header-flex">
              <h3>User Management</h3>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="ALL">All Roles</option>
                <option value="USER">Standard Users</option>
                <option value="VENDOR">Vendors</option>
              </select>
            </div>
            <table className="admin-table">
              <thead><tr><th>Username</th><th>Role</th><th>Action</th></tr></thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td><span className={`badge ${u.role === 'VENDOR' ? 'vendor-bg' : 'user-bg'}`}>{u.role}</span></td>
                    <td><button onClick={() => handleDeleteUser(u.id)} className="delete-btn-table">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EVENT TABLE */}
          <div className="table-container">
            <h3>Event Management</h3>
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{e.eventDate ? new Date(e.eventDate).toLocaleDateString() : 'N/A'}</td>
                    <td><button onClick={() => handleDeleteEvent(e.id)} className="delete-btn-table">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VENUE TABLE */}
          <div className="table-container">
            <h3>Venue Management (.NET)</h3>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Location</th><th>Action</th></tr></thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.id || v.Id}>
                    <td>{v.name || v.Name}</td>
                    <td>{v.location || v.Location}</td>
                    <td><button onClick={() => handleDeleteVenue(v.id || v.Id)} className="delete-btn-table">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOOKINGS TABLE */}
          <div className="table-container">
            <h3>Bookings Management</h3>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td><span className="status-label">{b.status || 'Confirmed'}</span></td>
                    <td><button onClick={() => handleDeleteBooking(b.id)} className="delete-btn-table">Cancel</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;