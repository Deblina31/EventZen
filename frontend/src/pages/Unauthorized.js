import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const REDIRECT = { USER: "/user", VENDOR: "/vendor/dashboard", ADMIN: "/admin" };

const Unauthorized = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
        <h2 className="page-title" style={{ marginBottom: "0.5rem" }}>Access Denied</h2>
        <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
          You don't have permission to view this page.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate(role ? REDIRECT[role] : "/login")}
        >
          {role ? "Go to Dashboard" : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;