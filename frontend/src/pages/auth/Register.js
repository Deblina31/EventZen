import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

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
    if (!form.username || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    if (!form.email.includes("@")) {
      alert("Enter a valid email");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8080/auth/register",
        form
      );

      const token = res.data.token;

      if (!token) {
        alert("Registration failed");
        return;
      }

      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.roles[0];

      if (role === "USER") navigate("/user");
      if (role === "VENDOR") navigate("/vendor");
      if (role === "ADMIN") navigate("/admin");

    } catch (err) {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="input-field"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="input-field"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="input-field"
        />

        <select
          name="role"
          onChange={handleChange}
          className="input-field"
        >
          <option value="USER">User</option>
          <option value="VENDOR">Vendor</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="register-btn"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="login-text">
          Already have an account?
          <span
            className="login-link"
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