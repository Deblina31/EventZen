import { useEffect, useState ,useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";

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
}, [token]); // ✅ dependency

 useEffect(() => {
  fetchAllData();
}, [fetchAllData]);

  // 🗑️ Delete user
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User deleted 🗑️");

      // refresh list
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", width: "100%" }}>
        <h2>Admin Dashboard 👑</h2>

        {/* 🔥 STATS */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={cardStyle}>
            <h3>👥 Users</h3>
            <p>{users.length}</p>
          </div>

          <div style={cardStyle}>
            <h3>🎉 Events</h3>
            <p>{events.length}</p>
          </div>

          <div style={cardStyle}>
            <h3>🎟️ Bookings</h3>
            <p>{bookings.length}</p>
          </div>
        </div>

        {/* 👥 USER LIST */}
        <h3>All Users</h3>

        {users.length === 0 ? (
          <p>No users found 😢</p>
        ) : (
          users.map((user) => (
            <div key={user.id} style={userCard}>
              <p><b>ID:</b> {user.id}</p>
              <p><b>Username:</b> {user.username}</p>

              <button
                onClick={() => handleDeleteUser(user.id)}
                style={deleteBtn}
              >
                Delete ❌
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 💅 styles
const cardStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  borderRadius: "10px",
  width: "150px",
  textAlign: "center",
};

const userCard = {
  border: "1px solid #ddd",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "8px",
};

const deleteBtn = {
  background: "red",
  color: "white",
  border: "none",
  padding: "5px 10px",
  cursor: "pointer",
  borderRadius: "5px",
};

export default AdminDashboard;