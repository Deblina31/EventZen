// src/pages/Home.js
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      padding: "20px"
    }}>
      <h1 style={{ color: "#333" }}>Welcome to EventZen 🎉</h1>
      <p style={{ fontSize: "18px", color: "#555", textAlign: "center", maxWidth: "500px" }}>
        Manage events, venues, and users with ease. Choose your role to continue.
      </p>

      <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
        <Link to="/login">
          <button style={{
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
            fontSize: "16px"
          }}>Login</button>
        </Link>
        
        <Link to="/about">
          <button style={{
            padding: "10px 20px",
            borderRadius: "5px",
            border: "1px solid #007bff",
            backgroundColor: "white",
            color: "#007bff",
            cursor: "pointer",
            fontSize: "16px"
          }}>About</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;