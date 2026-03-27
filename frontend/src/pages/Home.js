import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Calendar, Building2, Ticket, BarChart3 } from 'lucide-react';

const FEATURES = [
  { icon: <Calendar size={24} />, title: "Event Scheduling", desc: "Schedule and manage events easily" },
  { icon: <Building2 size={24} />, title: "Venue Management", desc: "Browse and book venues seamlessly" },
  { icon: <Ticket size={24} />, title: "Easy Booking",     desc: "Register for events" },
  { icon: <BarChart3 size={24} />, title: "Budget Tracking",   desc: "Track and monitor expenses" },
];

const Home = () => {
  const { role } = useAuth();
  const REDIRECT = { USER: "/user", VENDOR: "/vendor/dashboard", ADMIN: "/admin" };

  return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center", padding: "3rem 2rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.75rem" }}>
          Welcome to EventZen
        </h1>
        <p style={{ color: "var(--gray-600)", maxWidth: 480, margin: "0 auto 2rem" }}>
          A platform for managing events, venues, bookings and attendees.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          {role ? (
            <Link to={REDIRECT[role]}>
              <button className="btn btn-primary">Go to Dashboard</button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button className="btn btn-primary">Login</button>
              </Link>
              <Link to="/register">
                <button className="btn btn-outline">Register</button>
              </Link>
            </>
          )}
        </div>
      </div>

      
      <div className="grid-4">
        {FEATURES.map((f) => (
          <div className="card" key={f.title} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>{f.title}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;