import { useState, useEffect } from "react";
import { inventoryAPI } from "../services/api";

const AssetsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLogs();
  }, []);

  const fetchMyLogs = async () => {
    try {
      const { data } = await inventoryAPI.getMyLogs();
      setLogs(data.logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">My Assets</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Item</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Action</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-600 dark:text-gray-400">
                  No assets issued yet
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                    {log.itemId?.itemName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      log.action === "ISSUE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                    {log.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetsPage;
