import { useState, useEffect } from "react";
import { taskAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import Button from "../components/ui/Button";
import { Drawer } from "../components/ui/Drawer";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const TasksPage = () => {
  const { user } = useAuth();
  const { openRightSidebar, closeRightSidebar, isRightSidebarOpen } =
    useSidebar();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isRightSidebarOpen) {
      updateRightSidebar();
    }
  }, [formData, formLoading, users, isRightSidebarOpen, selectedTask]);

  const updateRightSidebar = () => {
    openRightSidebar(
      <Drawer
        onClose={closeRightSidebar}
        title={selectedTask ? "Update Objective" : "+ New Objective"}
        footer={
          <div className="flex gap-3">
            <Button
              form="task-form"
              type="submit"
              className="flex-1 py-3.5 text-[10px] font-bold rounded uppercase tracking-[2px] shadow-lg shadow-brand-500/20 active:scale-[0.98]"
              disabled={formLoading}
            >
              {formLoading
                ? "Synchronizing..."
                : selectedTask
                  ? "Update Task"
                  : "Create Task"}
            </Button>
            <button
              type="button"
              onClick={closeRightSidebar}
              className="flex-1 py-3.5 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded uppercase tracking-widest transition-colors font-sans"
            >
              Cancel
            </button>
          </div>
        }
      >
        <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
              Objective Title
            </label>
            <input
              type="text"
              placeholder="e.g. Audit Log..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
              Detailed Brief
            </label>
            <textarea
              placeholder="Scope of work..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-sm"
              rows="4"
            ></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
              Assign Lead
            </label>
            <Select
              options={[
                { value: "", label: "Select Personnel" },
                ...users.map((u) => ({ value: u._id, label: u.name })),
              ]}
              value={formData.assignedTo}
              onChange={(val) => setFormData({ ...formData, assignedTo: val })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
              Hard Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none font-semibold text-xs"
              required
            />
          </div>
        </form>
      </Drawer>,
    );
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await taskAPI.getAll();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.getAll();
      setUsers(
        data.users.filter((u) => u.role === "EMPLOYEE" || u.role === "MANAGER"),
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
    });
    openRightSidebar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (selectedTask) {
        await taskAPI.updateStatus(selectedTask._id, formData);
        toast.success("Objective updated successfully");
      } else {
        await taskAPI.create(formData);
        toast.success("Task assigned successfully");
      }
      closeRightSidebar();
      setFormData({ title: "", description: "", assignedTo: "", deadline: "" });
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving task");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This objective will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e40af",
      cancelButtonColor: "#ef4444",
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
        await taskAPI.delete(id);
        Swal.fire({
          title: "Removed!",
          text: "Task has been deleted.",
          icon: "success",
          background: document.documentElement.className.includes("dark")
            ? "#111827"
            : "#fff",
          color: document.documentElement.className.includes("dark")
            ? "#fff"
            : "#000",
        });
        fetchTasks();
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting task");
      }
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">
            Tasks Tracking
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold tracking-widest uppercase">
            Monitor and assign project deliverables
          </p>
        </div>
        {(user.role === "ADMIN" || user.role === "MANAGER") && (
          <Button
            onClick={() => {
              setSelectedTask(null);
              setFormData({
                title: "",
                description: "",
                assignedTo: "",
                deadline: "",
              });
              openRightSidebar(null);
            }}
            size="sm"
            className="rounded shadow-lg shadow-brand-500/20"
          >
            + New Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-48 rounded bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 animate-pulse"
              ></div>
            ))
        ) : tasks.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[4px] opacity-40">
              No tasks active
            </span>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-slate-100 dark:border-gray-700 hover:border-brand-200 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    task.status === "DONE"
                      ? "bg-emerald-100 text-emerald-700"
                      : task.status === "LATE"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {task.status}
                </span>
                {(user.role === "ADMIN" || user.role === "MANAGER") && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="text-slate-300 hover:text-brand-500 transition-colors"
                      title="Edit Task"
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
                      onClick={() => handleDelete(task._id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 leading-tight">
                {task.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 line-clamp-2 font-medium">
                {task.description}
              </p>

              <div className="pt-4 border-t border-slate-50 dark:border-gray-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                    {task.assignedTo?.name?.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-gray-300 truncate">
                    {task.assignedTo?.name || "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg
                    className="w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.1"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[10px] font-black uppercase">
                    {new Date(task.deadline).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksPage;
