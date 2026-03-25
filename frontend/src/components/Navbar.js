import { getUserRole } from "../utils/jwt";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const role = getUserRole();
  const navigate = useNavigate();

  const links = {
    USER: [
      { name: "Event Feed", path: "/user" },
      { name: "My Bookings", path: "/my-bookings" },
    ],
    VENDOR: [
      { name: "Dashboard", path: "/vendor" },
      { name: "My Venues", path: "/vendor/my-venues" },
    ],
    ADMIN: [
      { name: "Dashboard", path: "/admin" },
      { name: "Users", path: "/admin/users" },
      { name: "Venues", path: "/admin/venues" },
      { name: "All Bookings", path: "/admin/bookings" },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>
        <h3>{role} Panel</h3>
      </div>

      <ul className="nav-links">
        {links[role]?.map((link) => (
          <li key={link.path} onClick={() => navigate(link.path)}>
            {link.name}
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;