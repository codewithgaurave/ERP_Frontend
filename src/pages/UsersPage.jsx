import { useState, useEffect, useMemo } from "react";
import { userAPI } from "../services/api";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import Toggle from "../components/ui/Toggle";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";
import { Drawer } from "../components/ui/Drawer";
import Swal from "sweetalert2";

const UsersPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { openRightSidebar, closeRightSidebar, isRightSidebarOpen } =
    useSidebar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    salary: 0,
    status: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "EMPLOYEE", label: "Employee" },
    { value: "MANAGER", label: "Manager" },
    { value: "HR", label: "HR" },
    { value: "INVENTORY", label: "Inventory" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  // Debounce Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers(1);
  }, [filters, debouncedSearch]);

  useEffect(() => {
    if (isRightSidebarOpen) {
      updateRightSidebar();
    }
  }, [formData, formLoading, selectedUser, isRightSidebarOpen]);

  // OPTIMIZATION: Memoize filtered users to avoid recalculating on every render
  const visibleUsers = useMemo(() => {
    const isRequesterAdmin = currentUser?.role?.toUpperCase() === "ADMIN";
    return users.filter((u) => {
      // Hide other ADMINs if the current user is an ADMIN
      if (isRequesterAdmin && u.role?.toUpperCase() === "ADMIN") return false;
      return true;
    });
  }, [users, currentUser]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await userAPI.getAll({
        page,
        limit: pagination.limit,
        search: debouncedSearch,
        ...filters,
      });
      setUsers(data.users);
      setPagination({
        ...pagination,
        totalUsers: data.pagination.totalUsers,
        totalPages: data.pagination.totalPages,
        currentPage: data.pagination.currentPage,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  const toggleStatus = async (id) => {
    try {
      setTogglingId(id);
      const { data } = await userAPI.toggleStatus(id);

      // OPTIMIZATON: Update local state instead of re-fetching the entire list
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === id ? { ...u, status: !u.status } : u)),
      );

      toast.success(data.message || "Status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e40af", // brand-800
      cancelButtonColor: "#ef4444", // red-500
      confirmButtonText: "Yes, delete it!",
      background: document.documentElement.className.includes("dark")
        ? "#111827"
        : "#fff",
      color: document.documentElement.className.includes("dark")
        ? "#fff"
        : "#000",
    });

    if (result.isConfirmed) {
      try {
        await userAPI.delete(id);
        Swal.fire({
          title: "Deleted!",
          text: "Personnel record expunged.",
          icon: "success",
          background: document.documentElement.className.includes("dark")
            ? "#111827"
            : "#fff",
          color: document.documentElement.className.includes("dark")
            ? "#fff"
            : "#000",
        });
        fetchUsers(pagination.currentPage);
      } catch (error) {
        toast.error("Error deleting user");
      }
    }
  };

  const updateRightSidebar = () => {
    openRightSidebar(
      <Drawer
        onClose={closeRightSidebar}
        title={selectedUser ? "Update User" : "Create User"}
        footer={
          <div className="flex gap-3">
            <Button
              form="user-form"
              type="submit"
              className="flex-1 py-3.5 text-[10px] font-bold rounded uppercase tracking-[2px] shadow-lg shadow-brand-500/20 active:scale-[0.98]"
              disabled={formLoading}
            >
              {formLoading
                ? "Synchronizing..."
                : selectedUser
                  ? "Update User"
                  : "Create User"}
            </Button>
            <button
              type="button"
              onClick={closeRightSidebar}
              className="flex-1 py-3.5 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
          </div>
        }
      >
        <form id="user-form" onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[1.5px]">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Abhay"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 transition-all font-semibold text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[1.5px]">
              Email
            </label>
            <input
              type="email"
              placeholder="abhay@conctrum.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 transition-all font-semibold text-sm"
              required
            />
          </div>

          {!selectedUser && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 transition-all font-semibold text-sm"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                Assigned Role
              </label>
              <Select
                options={[
                  { value: "EMPLOYEE", label: "Employee" },
                  { value: "MANAGER", label: "Manager" },
                  { value: "HR", label: "HR" },
                  { value: "INVENTORY", label: "Inventory" },
                ]}
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                Base Salary
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none font-semibold text-xs"
                required
              />
            </div>
          </div>

          {selectedUser && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                Current Status
              </label>
              <Select
                options={[
                  { value: true, label: "Active" },
                  { value: false, label: "Inactive" },
                ]}
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
              />
            </div>
          )}
        </form>
      </Drawer>,
    );
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      salary: 0,
      status: true,
    });
    // The useEffect will trigger updateRightSidebar when formData is set
    openRightSidebar(null); // Just signal it's open, content will follow
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      salary: user.salary,
      status: user.status,
    });
    openRightSidebar(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const submissionData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        salary: Number(formData.salary),
        status: formData.status,
      };

      // Only include password if we are creating a new user
      if (!selectedUser) {
        submissionData.password = formData.password;
      }

      if (selectedUser) {
        await userAPI.update(selectedUser._id, submissionData);
        toast.success(`${submissionData.name}'s record updated`);
      } else {
        await userAPI.create(submissionData);
        toast.success(`${submissionData.name} added successfully`);
      }
      closeRightSidebar();
      fetchUsers(pagination?.currentPage || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">
            Users Management
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold tracking-widest uppercase">
            Manage your team and their access levels
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          size="sm"
          className="rounded shadow-lg shadow-brand-500/20"
        >
          + Add User
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 px-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full px-4 py-2.5 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/20 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          options={roleOptions}
          value={filters.role}
          onChange={(val) => setFilters({ ...filters, role: val })}
          placeholder="Filter by Role"
          className="rounded shadow-sm"
        />
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(val) => setFilters({ ...filters, status: val })}
          placeholder="Filter by Status"
          className="rounded shadow-sm"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-slate-100 dark:border-gray-700 mx-2">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-slate-500 font-medium">
                        Syncing...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-400 text-[10px] bg-slate-50/20 italic uppercase tracking-[4px] font-black"
                  >
                    No matching records
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {user.name}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "MANAGER"
                              ? "bg-blue-100 text-blue-700"
                              : user.role === "HR"
                                ? "bg-emerald-100 text-emerald-700"
                                : user.role === "INVENTORY"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-white">
                      ₹{user.salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Toggle
                        enabled={user.status}
                        onChange={() => toggleStatus(user._id)}
                        loading={togglingId === user._id}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-brand-500/10 rounded-lg transition-all border border-transparent hover:border-brand-100 dark:hover:border-brand-500/20 active:scale-90"
                          title="Edit User"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20 active:scale-90"
                          title="Delete User"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-gray-900/50 border-t border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            {users.length} OF {pagination?.totalUsers || 0} RECORDS
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                handlePageChange((pagination?.currentPage || 1) - 1)
              }
              disabled={(pagination?.currentPage || 1) === 1 || loading}
              className="px-4 py-2 text-[10px] font-bold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 dark:hover:border-gray-600 transition-all uppercase tracking-widest active:scale-95 shadow-sm dark:text-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() =>
                handlePageChange((pagination?.currentPage || 1) + 1)
              }
              disabled={
                (pagination?.currentPage || 1) ===
                  (pagination?.totalPages || 1) || loading
              }
              className="px-4 py-2 text-[10px] font-bold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 dark:hover:border-gray-600 transition-all uppercase tracking-widest active:scale-95 shadow-sm dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
