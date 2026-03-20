import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    // ✅ Validation
    if (!form.username || !form.password) {
      alert("Please fill all fields ⚠️");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8080/auth/login",
        form
      );

      console.log("LOGIN RESPONSE 👉", res.data);

      const token = res.data.token;

      if (!token) {
        alert("Login failed ❌");
        return;
      }

      // ✅ Save token
      localStorage.setItem("token", token);

      // ✅ Decode JWT
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.roles[0];

      // ✅ Redirect based on role
      if (role === "USER") navigate("/user");
      if (role === "VENDOR") navigate("/vendor");
      if (role === "ADMIN") navigate("/admin");

    } catch (err) {
      console.error(err);
      alert("Invalid credentials ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          padding: "30px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          background: "#fff",
          width: "300px",
          textAlign: "center",
        }}
      >
        <h2>Login 🔐</h2>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", margin: "10px 0" }}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", margin: "10px 0" }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login 🚀"}
        </button>

        {/* ✅ Register redirect */}
        <p style={{ marginTop: "15px" }}>
          Don’t have an account?{" "}
          <span
            style={{
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;