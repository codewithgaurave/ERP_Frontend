import { useState, useEffect } from "react";
import { payrollAPI } from "../services/api";

const SalaryPage = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPayroll();
  }, []);

  const fetchMyPayroll = async () => {
    try {
      const { data } = await payrollAPI.getMyPayroll();
      setPayrolls(data.payrolls);
    } catch (error) {
      console.error("Error fetching payroll:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">My Salary Slips</h1>

      <div className="grid gap-6">
        {payrolls.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
            <p className="text-slate-600 dark:text-gray-400">No salary slips available yet</p>
          </div>
        ) : (
          payrolls.map((payroll) => (
            <div key={payroll._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Salary Slip</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">Month: {payroll.month}</p>
                </div>
                <span className="text-2xl font-bold text-brand-600">₹{payroll.finalSalary}</span>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-gray-700">
                  <span className="text-slate-600 dark:text-gray-400">Base Salary</span>
                  <span className="font-semibold text-slate-800 dark:text-white">₹{payroll.salary}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-gray-700">
                  <span className="text-slate-600 dark:text-gray-400">Bonus</span>
                  <span className="font-semibold text-green-600">+₹{payroll.bonus}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-gray-700">
                  <span className="text-slate-600 dark:text-gray-400">Deduction (Late Tasks)</span>
                  <span className="font-semibold text-red-600">-₹{payroll.deduction}</span>
                </div>
                <div className="flex justify-between py-2 pt-4">
                  <span className="font-bold text-slate-800 dark:text-white">Final Salary</span>
                  <span className="font-bold text-brand-600 text-lg">₹{payroll.finalSalary}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SalaryPage;
