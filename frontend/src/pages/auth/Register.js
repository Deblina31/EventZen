import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    // ✅ Validation
    if (!form.username || !form.email || !form.password) {
      alert("Please fill all fields ⚠️");
      return;
    }

    // ✅ Simple email check
    if (!form.email.includes("@")) {
      alert("Enter a valid email ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8080/auth/register",
        form
      );

      console.log("REGISTER RESPONSE 👉", res.data);

      const token = res.data.token;

      if (!token) {
        alert("Registration failed ❌");
        return;
      }

      // ✅ Save token
      localStorage.setItem("token", token);

      // ✅ Decode role
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.roles[0];

      // ✅ Redirect
      if (role === "USER") navigate("/user");
      if (role === "VENDOR") navigate("/vendor");
      if (role === "ADMIN") navigate("/admin");

    } catch (err) {
      console.error(err);
      alert("Registration failed ❌");
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
        <h2>Register 📝</h2>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", margin: "10px 0" }}
        />

        <input
          name="email"
          placeholder="Email"
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

        <select
          name="role"
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", margin: "10px 0" }}
        >
          <option value="USER">User</option>
          <option value="VENDOR">Vendor</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Registering..." : "Register 🚀"}
        </button>

        {/* ✅ Login redirect */}
        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span
            style={{
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;