import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const isLoggedIn = localStorage.getItem("accessToken"); // Check if user is logged in
  const userData = localStorage.getItem("userData"); 

  if (!isLoggedIn || !userData) {
    return <Navigate to="/" replace />;
  }

  let parsedUserData = null;
  try {
    parsedUserData = JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing userData:", error);
    return <Navigate to="/" replace />;
  }

  if (!parsedUserData || !parsedUserData.role) {
    return <Navigate to="/" replace />;
  }

  const { role } = parsedUserData;
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Render the requested page
};

export default ProtectedRoute;
