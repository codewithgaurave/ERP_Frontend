import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI, taskAPI, payrollAPI, inventoryAPI } from "../services/api";
import PageMeta from "../components/common/PageMeta";
import EcommerceMetrics from "../components/Dashboard/EcommerceMetrics";
import MonthlySalesChart from "../components/Dashboard/MonthlySalesChart";
import StatisticsChart from "../components/Dashboard/StatisticsChart";
import MonthlyTarget from "../components/Dashboard/MonthlyTarget";
import RecentOrders from "../components/Dashboard/RecentOrders";
import DemographicCard from "../components/Dashboard/DemographicCard";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    payrolls: 0,
    inventory: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const promises = [];

      if (user.role === "ADMIN") {
        promises.push(
          userAPI.getAll(),
          taskAPI.getAll(),
          payrollAPI.getAll(),
          inventoryAPI.getAll(),
        );
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
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            Here's what's happening with your {user?.role?.toLowerCase()} panel
          </p>
        </div>

        {/* Role-based Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.role === "ADMIN" && (
            <>
              <StatCard
                title="Total Users"
                value={stats.users}
                icon="👥"
                color="purple"
              />
              <StatCard
                title="Total Tasks"
                value={stats.tasks}
                icon="📋"
                color="blue"
              />
              <StatCard
                title="Payroll Records"
                value={stats.payrolls}
                icon="💰"
                color="green"
              />
              <StatCard
                title="Inventory Items"
                value={stats.inventory}
                icon="📦"
                color="orange"
              />
            </>
          )}

          {user.role === "MANAGER" && (
            <>
              <StatCard
                title="Total Tasks"
                value={stats.tasks}
                icon="📋"
                color="blue"
              />
              <StatCard
                title="Pending Tasks"
                value={stats.tasks}
                icon="⏳"
                color="yellow"
              />
            </>
          )}

          {user.role === "HR" && (
            <>
              <StatCard
                title="Total Employees"
                value={stats.users}
                icon="👥"
                color="purple"
              />
              <StatCard
                title="Payroll Records"
                value={stats.payrolls}
                icon="💰"
                color="green"
              />
            </>
          )}

          {user.role === "EMPLOYEE" && (
            <>
              <StatCard
                title="My Tasks"
                value={stats.tasks}
                icon="📋"
                color="blue"
              />
              <StatCard
                title="Salary Slips"
                value={stats.payrolls}
                icon="💰"
                color="green"
              />
            </>
          )}

          {user.role === "INVENTORY" && (
            <StatCard
              title="Inventory Items"
              value={stats.inventory}
              icon="📦"
              color="orange"
            />
          )}
        </div>

        {/* Visual Charts & Metrics (Grievance Project Style) */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <EcommerceMetrics />
            <MonthlySalesChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget />
          </div>

          <div className="col-span-12">
            <StatisticsChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <DemographicCard />
          </div>

          <div className="col-span-12 xl:col-span-7">
            <RecentOrders />
          </div>
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
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            {value}
          </h3>
        </div>
        <div
          className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-xl md:text-2xl shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
