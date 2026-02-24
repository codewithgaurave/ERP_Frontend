import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Toggle from "../components/ui/Toggle";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";

const UsersPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const roleOptions = [
    { label: "All Roles", value: "" },
    { label: "HR", value: "HR" },
    { label: "Manager", value: "MANAGER" },
    { label: "Employee", value: "EMPLOYEE" },
    { label: "Inventory", value: "INVENTORY" },
  ];

  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.search]);

  useEffect(() => {
    fetchUsers(1);
  }, [debouncedSearch, filters.role, filters.status]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: debouncedSearch,
        role: filters.role,
        status: filters.status,
      };
      const { data } = await userAPI.getAll(params);
      setUsers(data.users || []);
      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          totalUsers: data.users?.length || 0,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      fetchUsers(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      try {
        await userAPI.delete(id);
        toast.success("User deleted successfully");
        fetchUsers(pagination?.currentPage || 1);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      await userAPI.toggleStatus(id);
      toast.success("Status updated");
      fetchUsers(pagination?.currentPage || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
          Users Management
        </h1>
        <Button onClick={() => navigate("/users/add")} size="sm">
          + Add User
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <Select
          options={roleOptions}
          value={filters.role}
          onChange={(val) => setFilters({ ...filters, role: val })}
          placeholder="All Roles"
        />
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(val) => setFilters({ ...filters, status: val })}
          placeholder="All Status"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-slate-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-gray-900">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                  Email
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                  Salary
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-8 text-center text-slate-500 text-sm"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-slate-500 text-sm"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users
                  .filter((user) => {
                    // Hide ADMINs from the list if current user is an ADMIN
                    const isRequesterAdmin =
                      currentUser?.role?.toUpperCase() === "ADMIN";
                    if (
                      isRequesterAdmin &&
                      user.role?.toUpperCase() === "ADMIN"
                    )
                      return false;
                    return true;
                  })
                  .map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "MANAGER"
                                ? "bg-blue-100 text-blue-700"
                                : user.role === "HR"
                                  ? "bg-green-100 text-green-700"
                                  : user.role === "INVENTORY"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">
                        ₹{user.salary.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <Toggle
                          enabled={user.status}
                          onChange={() => toggleStatus(user._id)}
                        />
                      </td>
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/users/edit/${user._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-gray-900 border-t border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
            Showing {users.length} of {pagination?.totalUsers || 0} users
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                handlePageChange((pagination?.currentPage || 1) - 1)
              }
              disabled={(pagination?.currentPage || 1) === 1 || loading}
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
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
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
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
