import { useState, useEffect } from "react";
import { payrollAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

const PayrollPage = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userId: "", month: "", bonus: 0 });

  useEffect(() => {
    fetchPayrolls();
    if (user.role === "ADMIN" || user.role === "HR") {
      fetchUsers();
    }
  }, []);

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
    try {
      await payrollAPI.generate(formData);
      setShowModal(false);
      setFormData({ userId: "", month: "", bonus: 0 });
      fetchPayrolls();
    } catch (error) {
      alert(error.response?.data?.message || "Error generating payroll");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Payroll Management</h1>
        {(user.role === "ADMIN" || user.role === "HR") && (
          <Button onClick={() => setShowModal(true)}>+ Generate Payroll</Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Month</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Base Salary</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Bonus</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Deduction</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Final Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
            {payrolls.map((payroll) => (
              <tr key={payroll._id} className="hover:bg-slate-50 dark:hover:bg-gray-900">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">{payroll.userId?.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{payroll.month}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">₹{payroll.salary}</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">+₹{payroll.bonus}</td>
                <td className="px-6 py-4 text-sm text-red-600 font-semibold">-₹{payroll.deduction}</td>
                <td className="px-6 py-4 text-sm font-bold text-brand-600">₹{payroll.finalSalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate Payroll">
          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required>
              <option value="">Select Employee</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} - {u.role}</option>)}
            </select>
            <input type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            <input type="number" placeholder="Bonus (optional)" value={formData.bonus} onChange={(e) => setFormData({ ...formData, bonus: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            <Button type="submit">Generate Payroll</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PayrollPage;
