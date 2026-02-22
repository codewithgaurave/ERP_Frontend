import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI, taskAPI, payrollAPI, inventoryAPI } from "../services/api";
import PageMeta from "../components/common/PageMeta";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, tasks: 0, payrolls: 0, inventory: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const promises = [];
      
      if (user.role === "ADMIN") {
        promises.push(userAPI.getAll(), taskAPI.getAll(), payrollAPI.getAll(), inventoryAPI.getAll());
      } else if (user.role === "MANAGER") {
        promises.push(taskAPI.getAll());
      } else if (user.role === "HR") {
        promises.push(userAPI.getAll(), payrollAPI.getAll());
      } else if (user.role === "EMPLOYEE") {
        promises.push(taskAPI.getMyTasks(), payrollAPI.getMyPayroll());
      } else if (user.role === "INVENTORY") {
        promises.push(inventoryAPI.getAll());
      }

      const results = await Promise.all(promises);
      
      if (user.role === "ADMIN") {
        setStats({
          users: results[0]?.data?.users?.length || 0,
          tasks: results[1]?.data?.tasks?.length || 0,
          payrolls: results[2]?.data?.payrolls?.length || 0,
          inventory: results[3]?.data?.items?.length || 0,
        });
      } else if (user.role === "MANAGER") {
        setStats({ tasks: results[0]?.data?.tasks?.length || 0 });
      } else if (user.role === "HR") {
        setStats({
          users: results[0]?.data?.users?.length || 0,
          payrolls: results[1]?.data?.payrolls?.length || 0,
        });
      } else if (user.role === "EMPLOYEE") {
        setStats({
          tasks: results[0]?.data?.tasks?.length || 0,
          payrolls: results[1]?.data?.payrolls?.length || 0,
        });
      } else if (user.role === "INVENTORY") {
        setStats({ inventory: results[0]?.data?.items?.length || 0 });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <PageMeta title="Dashboard | ERP Panel" description="ERP Dashboard" />
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome, {user?.name}!</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Here's what's happening with your {user?.role.toLowerCase()} panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {user.role === "ADMIN" && (
            <>
              <StatCard title="Total Users" value={stats.users} icon="👥" color="purple" />
              <StatCard title="Total Tasks" value={stats.tasks} icon="📋" color="blue" />
              <StatCard title="Payroll Records" value={stats.payrolls} icon="💰" color="green" />
              <StatCard title="Inventory Items" value={stats.inventory} icon="📦" color="orange" />
            </>
          )}
          
          {user.role === "MANAGER" && (
            <>
              <StatCard title="Total Tasks" value={stats.tasks} icon="📋" color="blue" />
              <StatCard title="Pending Tasks" value={stats.tasks} icon="⏳" color="yellow" />
            </>
          )}
          
          {user.role === "HR" && (
            <>
              <StatCard title="Total Employees" value={stats.users} icon="👥" color="purple" />
              <StatCard title="Payroll Records" value={stats.payrolls} icon="💰" color="green" />
            </>
          )}
          
          {user.role === "EMPLOYEE" && (
            <>
              <StatCard title="My Tasks" value={stats.tasks} icon="📋" color="blue" />
              <StatCard title="Salary Slips" value={stats.payrolls} icon="💰" color="green" />
            </>
          )}
          
          {user.role === "INVENTORY" && (
            <StatCard title="Inventory Items" value={stats.inventory} icon="📦" color="orange" />
          )}
        </div>
      </div>
    </>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    yellow: "from-yellow-500 to-yellow-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
