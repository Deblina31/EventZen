import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import MyBookings from "./pages/user/MyBookings";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import MyVenues from "./pages/vendor/MyVenues";
import ViewVenue from "./pages/vendor/ViewVenue";
import EditVenue from "./pages/vendor/EditVenue";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "20px" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Routes */}
          <Route path="/user" element={<ProtectedRoute roles={["USER"]}><UserDashboard /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute roles={["USER"]}><MyBookings /></ProtectedRoute>} />

          {/* Vendor Routes */}
          <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="/vendor/dashboard" element={<ProtectedRoute roles={["VENDOR"]}><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/my-venues" element={<ProtectedRoute roles={["VENDOR"]}><MyVenues /></ProtectedRoute>} />
          <Route path="/vendor/edit/:id" element={<ProtectedRoute roles={["VENDOR"]}><EditVenue /></ProtectedRoute>} />
          <Route path="/vendor/view/:id" element={<ProtectedRoute roles={["VENDOR"]}><ViewVenue /></ProtectedRoute>} />

          {/* Admin Routes*/}
          <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/venues" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;