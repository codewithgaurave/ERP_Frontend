import { useState, useEffect } from "react";
import { taskAPI } from "../services/api";
import Button from "../components/ui/Button";

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const { data } = await taskAPI.getMyTasks();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await taskAPI.updateStatus(id, { status });
      fetchMyTasks();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating task");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">My Tasks</h1>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
            <p className="text-slate-600 dark:text-gray-400">No tasks assigned yet</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{task.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-3">{task.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-slate-600 dark:text-gray-400">
                      <strong>Assigned by:</strong> {task.assignedBy?.name}
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
                  {task.status === "PENDING" && (
                    <Button onClick={() => handleStatusUpdate(task._id, "DONE")}>Mark Done</Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasksPage;
