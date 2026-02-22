import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import Button from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "EMPLOYEE", salary: 0 });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.getAll();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await userAPI.update(editId, formData);
      } else {
        await userAPI.create(formData);
      }
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", salary: 0 });
      setEditId(null);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving user");
    }
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setFormData({ name: user.name, email: user.email, role: user.role, salary: user.salary, password: "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      try {
        await userAPI.delete(id);
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      await userAPI.toggleStatus(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error toggling status");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Users Management</h1>
        <Button onClick={() => { setShowModal(true); setEditId(null); setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", salary: 0 }); }}>
          + Add User
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Salary</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-gray-900">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                    user.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                    user.role === "HR" ? "bg-green-100 text-green-700" :
                    user.role === "INVENTORY" ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">₹{user.salary}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(user._id)} className={`px-3 py-1 rounded-full text-xs font-bold ${user.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.status ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 mr-3 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit User" : "Add User"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            {!editId && <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />}
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR">HR</option>
              <option value="INVENTORY">Inventory</option>
              <option value="ADMIN">Admin</option>
            </select>
            <input type="number" placeholder="Salary" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            <Button type="submit">{editId ? "Update" : "Create"} User</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;
