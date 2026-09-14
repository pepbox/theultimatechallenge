import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useParams, useLocation } from "react-router-dom";

const AuthWrapper = ({ children, role }) => {
  const { sessionId } = useParams();
  const location = useLocation();
  const { authenticated: adminAuthenticated, sessionId: adminSessionId } =
    useSelector((state) => state.admin);

  const { authenticated : superAdminAuthenticated } = useSelector((state) => state.superadmin);

  if (role === "admin") {
    if (adminAuthenticated && sessionId === adminSessionId) {
      return children;
    } else {
      return <Navigate to={`/admin/${sessionId}/login${location.search || ''}`} replace />;
    }
  }

  if (role === "superadmin") {
    if (superAdminAuthenticated) {
      return children;
    } else {
      return <Navigate to={`/superadmin/login/${location.search || ''}`} replace />;
    }
  }

  // Default return for other roles or cases
  return children;
};

export default AuthWrapper;
