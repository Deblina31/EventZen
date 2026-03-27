import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const REDIRECT = { USER: "/user", VENDOR: "/vendor/dashboard", ADMIN: "/admin" };

// ✅ 1. MOVE THIS OUTSIDE THE REGISTER COMPONENT
const Field = ({ label, name, type = "text", placeholder, required, form, errors, set }) => (
  <div className="form-group">
    <label className="form-label">
      {label}{required && <span className="text-danger"> *</span>}
    </label>
    <input
      className="form-input"
      type={type}
      placeholder={placeholder || label}
      value={form[name]}
      onChange={set(name)}
      style={errors[name] ? { borderColor: "var(--danger)" } : {}}
    />
    {errors[name] && (
      <p className="text-danger" style={{ fontSize: "0.78rem", marginTop: "0.25rem" }}>
        {errors[name]}
      </p>
    )}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "USER",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await registerUser(form);
      login(res.data.token);
      const role = res.data.role || JSON.parse(atob(res.data.token.split(".")[1])).role;
      toast.success("Account created successfully!");
      navigate(REDIRECT[role] || "/");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setErrors(data);
        const first = Object.values(data)[0];
        if (first) toast.error(first);
      } else {
        toast.error(typeof data === "string" ? data : "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. PASS PROPS TO THE FIELD COMPONENT BELOW
  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <Field label="Username" name="username" required placeholder="Choose a username" form={form} errors={errors} set={set} />
          <Field label="Email" name="email" type="email" required placeholder="your@email.com" form={form} errors={errors} set={set} />
          <Field label="Password" name="password" type="password" required placeholder="Min 8 characters" form={form} errors={errors} set={set} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <Field label="First Name" name="firstName" placeholder="First name" form={form} errors={errors} set={set} />
            <Field label="Last Name" name="lastName" placeholder="Last name" form={form} errors={errors} set={set} />
          </div>

          <Field label="Phone Number" name="phoneNumber" placeholder="+91 9876543210" form={form} errors={errors} set={set} />

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select className="form-select" value={form.role} onChange={set("role")}>
              <option value="USER">User — Browse & book events</option>
              <option value="VENDOR">Vendor — Manage venues & events</option>
              <option value="ADMIN">Admin — Full system access</option>
            </select>
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default Register;