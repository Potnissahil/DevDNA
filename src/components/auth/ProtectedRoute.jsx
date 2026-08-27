import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isRecovery, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (isRecovery) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
