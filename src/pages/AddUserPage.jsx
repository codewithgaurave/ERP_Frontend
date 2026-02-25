import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import { useNavigate, useParams } from "react-router";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const AddUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    salary: 0,
    status: true,
  });

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await userAPI.getById(id);
      const user = data.user;
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        salary: user.salary,
        status: user.status,
        password: "",
      });
    } catch (error) {
      toast.error("Error fetching user data");
      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData);
    try {
      setLoading(true);
      const submissionData = {
        ...formData,
        salary: Number(formData.salary),
      };

      if (id) {
        await userAPI.update(id, submissionData);
        toast.success("User updated successfully");
      } else {
        await userAPI.create(submissionData);
        toast.success("User created successfully");
      }
      navigate("/users");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 max-w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          {id ? "Edit User" : "Add User"}
        </h1>
        <Button variant="outline" onClick={() => navigate("/users")}>
          Back to List
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {!id && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR">HR</option>
                  <option value="INVENTORY">Inventory</option>
                  {/* Hide ADMIN option if current user is ADMIN */}
                  {currentUser?.role?.toUpperCase() !== "ADMIN" && (
                    <option value="ADMIN">Admin</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                  Salary
                </label>
                <input
                  type="number"
                  placeholder="Salary"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
                  required
                />
              </div>

              {id && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full py-4 text-base font-bold"
                disabled={loading}
              >
                {loading ? "Saving..." : id ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
