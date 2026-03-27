import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = {
  USER: [
    { name: "Events",      path: "/user" },
    { name: "My Bookings", path: "/my-bookings" },
  ],
  VENDOR: [
    { name: "Dashboard",  path: "/vendor/dashboard" },
    { name: "My Venues",  path: "/vendor/my-venues" },
  ],
  ADMIN: [
    { name: "Dashboard",  path: "/admin" },
    { name: "Users",      path: "/admin/users" },
    { name: "Venues",     path: "/admin/venues" },
    { name: "Bookings",   path: "/admin/bookings" },
  ],
};

const Navbar = () => {
  const { role, username, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };

  const roleLabel = { USER: "User", VENDOR: "Vendor", ADMIN: "Admin" }[role] || "";

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>
        EventZen
      </div>

      <ul className="nav-links">
        {NAV_LINKS[role]?.map((link) => (
          <li
            key={link.path}
            onClick={() => navigate(link.path)}
            style={location.pathname === link.path
              ? { background: "var(--primary-light)", color: "var(--primary)" }
              : {}}
          >
            {link.name}
          </li>
        ))}
      </ul>

      <div className="nav-right">
        {username && (
          <span className="nav-user">
            {username} · {roleLabel}
          </span>
        )}
        {role ? (
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;