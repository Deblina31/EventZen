import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);

  const token = localStorage.getItem("token");

  const fetchAllData = useCallback(async () => {
    try {
      // Fetching from all 4 microservices simultaneously
      const [userRes, eventRes, bookingRes, venueRes] = await Promise.all([
        axios.get("http://localhost:8080/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8081/events", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3001/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5193/venues", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Handle data nesting (e.g., .content for paginated Spring Boot responses)
      setUsers(userRes.data.content || userRes.data || []);
      setEvents(eventRes.data || []);
      setBookings(bookingRes.data || []);
      setVenues(venueRes.data || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Logic to match Event.venueId with Venue.id from Port 5193
  const getVenueName = (venueId) => {
    if (!venueId) return "No Venue ID";
    // Use == instead of === to handle string vs number ID differences
    const foundVenue = venues.find((v) => v.id == venueId);
    return foundVenue ? foundVenue.name : "Loading Venue...";
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:8080/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted");
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        <header className="admin-header">
          <h1>Admin Management Portal</h1>
          <p>Real-time overview of all microservices</p>
        </header>

        {/* Stats Summary Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Events</h3>
            <p className="stat-number">{events.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-number">{bookings.length}</p>
          </div>
        </div>

        {/* User Management Section */}
        <section className="data-section">
          <h2>User Management</h2>
          <div className="list-container">
            {users.length === 0 ? (
              <p className="empty-text">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="data-row">
                  <div className="info">
                    <span className="main-id">ID: {user.id}</span>
                    <span className="main-name">{user.username}</span>
                  </div>
                  <button onClick={() => handleDeleteUser(user.id)} className="btn-delete">
                    Delete User
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Events & Venues Section (Merged Data) */}
        <section className="data-section">
          <h2>Events & Venues</h2>
          <div className="list-container">
            {events.length === 0 ? (
              <p className="empty-text">No events found.</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="data-row border-blue">
                  <div className="info">
                    <span className="main-name">{event.name || event.title}</span>
                    <span className="sub-detail">
                      <strong>Venue:</strong> {getVenueName(event.venueId)}
                    </span>
                  </div>
                  <div className="badge">Event ID: {event.id}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Booking Section */}
        <section className="data-section">
          <h2>Booking History</h2>
          <div className="list-container">
            {bookings.length === 0 ? (
              <p className="empty-text">No bookings found.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="data-row border-green">
                  <div className="info">
                    <span className="main-name">Booking Ref: #{booking.id}</span>
                    <span className="sub-detail">User ID: {booking.userId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;