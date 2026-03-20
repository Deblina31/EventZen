// components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/jwt";

const ProtectedRoute = ({ roles, children }) => {
  const role = getUserRole();
  if (!role) return <Navigate to="/login" />;
  if (!roles.includes(role)) return <Navigate to="/unauthorized" />;
  return children;
};

export default ProtectedRoute;