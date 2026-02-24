import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import NotFound from "../pages/NotFound";
import UsersPage from "../pages/UsersPage";
import TasksPage from "../pages/TasksPage";
import PayrollPage from "../pages/PayrollPage";
import InventoryPage from "../pages/InventoryPage";
import MyTasksPage from "../pages/MyTasksPage";
import ProfilePage from "../pages/ProfilePage";
import SalaryPage from "../pages/SalaryPage";
import AssetsPage from "../pages/AssetsPage";
import AddUserPage from "../pages/AddUserPage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-slate-800 dark:text-white">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/add"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
              <PayrollPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "INVENTORY"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* HR Routes */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <MyTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salary"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <SalaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <AssetsPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path="/inventory-logs"
          element={
            <ProtectedRoute allowedRoles={["INVENTORY"]}>
              <AssetsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
