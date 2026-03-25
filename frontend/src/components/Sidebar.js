import { getUserRole } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const role = getUserRole();
  const navigate = useNavigate();

  const links = {
    USER: [
      { name: "Event Feed", path: "/user" },
      { name: "My Bookings", path: "/my-bookings" },
    ],
    VENDOR: [
      { name: "Dashboard", path: "/vendor" },
      { name: "My Venues (.NET)", path: "/vendor/my-venues" },
    ],
    ADMIN: [
      { name: "Dashboard", path: "/admin" },
      { name: "Manage Users (Auth)", path: "/admin/users" },
      { name: "Manage Venues (.NET)", path: "/admin/venues" },
      { name: "All Bookings", path: "/admin/bookings" },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ 
      width: "200px", 
      height: "100vh", 
      borderRight: "2px solid #ddd", 
      padding: "20px",
      display: "flex",
      flexDirection: "column"
    }}>
      <h3 style={{ marginBottom: "20px", color: "#333" }}>{role} Panel</h3>

      <div style={{ flex: 1 }}>
        {links[role]?.map((link) => (
          <div
            key={link.path}
            style={{ 
              cursor: "pointer", 
              padding: "10px 0", 
              borderBottom: "1px solid #eee",
              fontSize: "15px"
            }}
            onClick={() => navigate(link.path)}
          >
            {link.name}
          </div>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "8px",
          cursor: "pointer",
          background: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px"
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;