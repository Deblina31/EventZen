import { getUserRole } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const role = getUserRole();
  const navigate = useNavigate(); // ✅ FIX

  const links = {
    USER: [
      { name: "Dashboard", path: "/user" },
      { name: "My Bookings 🎟️", path: "/my-bookings" }, // ✅ added here
    ],
    VENDOR: [{ name: "Dashboard", path: "/vendor" }],
    ADMIN: [{ name: "Dashboard", path: "/admin" }],
  };

  return (
    <div style={{ padding: "10px", borderRight: "1px solid gray" }}>
      <h3>{role} Panel</h3>

      {links[role]?.map((link) => (
        <div
          key={link.path}
          style={{ cursor: "pointer", margin: "10px 0" }}
          onClick={() => navigate(link.path)}
        >
          {link.name}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;