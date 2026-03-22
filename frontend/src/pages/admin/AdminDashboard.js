import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);

  const token = localStorage.getItem("token");

  const fetchAllData = useCallback(async () => {
    try {
      const [userRes, eventRes, bookingRes] = await Promise.all([
        axios.get("http://localhost:8080/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8081/events", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3001/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(userRes.data.content || []);
      setEvents(eventRes.data || []);
      setBookings(bookingRes.data || []);
    } catch (err) {
      console.error("Admin fetch error", err);
    }
  }, [token]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDeleteUser = async (id) => {
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
    <div className="container">
      <Sidebar />

      <div className="content">
        <h2>Admin Dashboard</h2>

        <div className="card-container">
          <div className="card">
            <h3>Users</h3>
            <p>{users.length}</p>
          </div>

          <div className="card">
            <h3>Events</h3>
            <p>{events.length}</p>
          </div>

          <div className="card">
            <h3>Bookings</h3>
            <p>{bookings.length}</p>
          </div>
        </div>

        <h3>All Users</h3>

        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="user-card">
              <p><b>ID:</b> {user.id}</p>
              <p><b>Username:</b> {user.username}</p>

              <button
                onClick={() => handleDeleteUser(user.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;