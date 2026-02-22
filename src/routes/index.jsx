import { Routes, Route, Navigate } from "react-router";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login Page - Default landing */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Dashboard Layout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
