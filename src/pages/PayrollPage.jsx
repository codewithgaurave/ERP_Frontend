import { useState, useEffect } from "react";
import { payrollAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import { Drawer } from "../components/ui/Drawer";
import toast from "react-hot-toast";

const PayrollPage = () => {
  const { user } = useAuth();
  const { openRightSidebar, closeRightSidebar, isRightSidebarOpen } =
    useSidebar();
  const [payrolls, setPayrolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ userId: "", month: "", bonus: 0 });

  useEffect(() => {
    fetchPayrolls();
    if (user.role === "ADMIN" || user.role === "HR") {
      fetchUsers();
    }
  }, []);

  // Sync Right Sidebar
  useEffect(() => {
    if (isRightSidebarOpen) {
      updateRightSidebar();
    }
  }, [formData, users, formLoading, isRightSidebarOpen]);

  const fetchPayrolls = async () => {
    try {
      const { data } = await payrollAPI.getAll();
      setPayrolls(data.payrolls);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.getAll();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await payrollAPI.generate(formData);
      toast.success("Payroll generated successfully");
      closeRightSidebar();
      setFormData({ userId: "", month: "", bonus: 0 });
      fetchPayrolls();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error generating payroll");
    } finally {
      setFormLoading(false);
    }
  };

  const updateRightSidebar = () => {
    openRightSidebar(
      <Drawer
        onClose={closeRightSidebar}
        title="Generate Payroll"
        footer={
          <div className="flex gap-3">
            <Button
              form="payroll-form"
              type="submit"
              className="flex-1 py-3.5 text-[10px] font-bold rounded uppercase tracking-[2px] shadow-lg shadow-brand-500/20 active:scale-[0.98]"
              disabled={formLoading}
            >
              {formLoading ? "Processing..." : "Generate Payroll"}
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
        <form
          id="payroll-form"
          onSubmit={handleSubmit}
          className="space-y-6 text-left"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
              Select Employee
            </label>
            <Select
              options={[
                { value: "", label: "Assign Lead" },
                ...users.map((u) => ({
                  value: u._id,
                  label: `${u.name} (${u.role})`,
                })),
              ]}
              value={formData.userId}
              onChange={(val) => setFormData({ ...formData, userId: val })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
              Payroll Month
            </label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) =>
                setFormData({ ...formData, month: e.target.value })
              }
              className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
              Performance Bonus
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={formData.bonus}
                onChange={(e) =>
                  setFormData({ ...formData, bonus: e.target.value })
                }
                className="w-full pl-8 pr-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-sm"
              />
            </div>
          </div>
        </form>
      </Drawer>,
    );
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="">
      <div className="flex justify-between items-center mb-10 px-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">
            Payroll Records
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold tracking-widest uppercase">
            Financial Disbursements & Salary Slips
          </p>
        </div>
        {(user.role === "ADMIN" || user.role === "HR") && (
          <Button
            onClick={() => {
              setFormData({ userId: "", month: "", bonus: 0 });
              updateRightSidebar();
            }}
            className="rounded shadow-lg shadow-brand-500/20"
            size="sm"
          >
            + Generate Payroll
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                Employee
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                Month
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                Base Salary
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                Bonus
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                Deduction
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">
                Final Salary
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
            {payrolls.map((payroll) => (
              <tr
                key={payroll._id}
                className="hover:bg-slate-50 dark:hover:bg-gray-900"
              >
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                  {payroll.userId?.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">
                  {payroll.month}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                  ₹{payroll.salary}
                </td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                  +₹{payroll.bonus}
                </td>
                <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                  -₹{payroll.deduction}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-brand-600">
                  ₹{payroll.finalSalary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollPage;
