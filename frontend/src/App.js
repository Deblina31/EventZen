import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login        from "./pages/auth/Login";
import Register     from "./pages/auth/Register";
import Home         from "./pages/Home";
import Unauthorized from "./pages/Unauthorized";

import UserDashboard from "./pages/user/UserDashboard";
import MyBookings    from "./pages/user/MyBookings";

import VendorDashboard from "./pages/vendor/VendorDashboard";
import MyVenues        from "./pages/vendor/MyVenues";
import ViewVenue       from "./pages/vendor/ViewVenue";
import EditVenue       from "./pages/vendor/EditVenue";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar         from "./components/Navbar";
import Footer         from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: "80vh" }}>
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* USER */}
          <Route path="/user"        element={<ProtectedRoute roles={["USER"]}><UserDashboard /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute roles={["USER"]}><MyBookings /></ProtectedRoute>} />

          {/* VENDOR */}
          <Route path="/vendor"                element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="/vendor/dashboard"      element={<ProtectedRoute roles={["VENDOR"]}><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/my-venues"      element={<ProtectedRoute roles={["VENDOR"]}><MyVenues /></ProtectedRoute>} />
          <Route path="/vendor/edit/:id"       element={<ProtectedRoute roles={["VENDOR"]}><EditVenue /></ProtectedRoute>} />
          <Route path="/vendor/view/:id"       element={<ProtectedRoute roles={["VENDOR"]}><ViewVenue /></ProtectedRoute>} />

          {/* ADMIN — tabbed single page */}
          <Route path="/admin"          element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users"    element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/venues"   element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />

        </Routes>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </Router>
  );
}

export default App;