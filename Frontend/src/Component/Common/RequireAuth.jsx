import React, { useContext } from "react";
import { AuthContext } from "../backend/context/Auth";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children, allowedRoles }) => {
  const { user, hasAnyRole, loading, twoFactorRequired } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

    // If user needs 2FA
  if (twoFactorRequired) {
    return <Navigate to="/two-factor" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
