import { useState, useEffect } from "react";
import { taskAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", assignedTo: "", deadline: "" });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await taskAPI.getAll();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.getAll();
      setUsers(data.users.filter(u => u.role === "EMPLOYEE"));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.create(formData);
      setShowModal(false);
      setFormData({ title: "", description: "", assignedTo: "", deadline: "" });
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating task");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      try {
        await taskAPI.delete(id);
        fetchTasks();
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting task");
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Tasks Management</h1>
        {(user.role === "ADMIN" || user.role === "MANAGER") && (
          <Button onClick={() => setShowModal(true)}>+ Create Task</Button>
        )}
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{task.title}</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-3">{task.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-600 dark:text-gray-400">
                    <strong>Assigned to:</strong> {task.assignedTo?.name}
                  </span>
                  <span className="text-slate-600 dark:text-gray-400">
                    <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  task.status === "DONE" ? "bg-green-100 text-green-700" :
                  task.status === "LATE" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {task.status}
                </span>
                {(user.role === "ADMIN" || user.role === "MANAGER") && (
                  <button onClick={() => handleDelete(task._id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Task">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Task Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" rows="3"></textarea>
            <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required>
              <option value="">Select Employee</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            <Button type="submit">Create Task</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TasksPage;
