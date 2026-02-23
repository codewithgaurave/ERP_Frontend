import { useState, useEffect } from "react";
import { inventoryAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

const InventoryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [formData, setFormData] = useState({ itemName: "", quantity: 0 });
  const [issueData, setIssueData] = useState({ itemId: "", userId: "", quantity: 0, action: "ISSUE" });

  useEffect(() => {
    fetchItems();
    fetchUsers();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await inventoryAPI.getAll();
      setItems(data.items);
    } catch (error) {
      console.error("Error fetching items:", error);
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
      await inventoryAPI.addItem(formData);
      setShowModal(false);
      setFormData({ itemName: "", quantity: 0 });
      fetchItems();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding item");
    }
  };

  const handleIssueReturn = async (e) => {
    e.preventDefault();
    try {
      if (issueData.action === "ISSUE") {
        await inventoryAPI.issue(issueData);
      } else {
        await inventoryAPI.return(issueData);
      }
      setShowIssueModal(false);
      setIssueData({ itemId: "", userId: "", quantity: 0, action: "ISSUE" });
      fetchItems();
    } catch (error) {
      alert(error.response?.data?.message || "Error processing request");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Inventory Management</h1>
        <div className="flex gap-3">
          {(user.role === "ADMIN" || user.role === "INVENTORY") && (
            <>
              <Button onClick={() => setShowModal(true)}>+ Add Item</Button>
              <Button onClick={() => setShowIssueModal(true)}>Issue/Return</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{item.itemName}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                item.quantity > 10 ? "bg-green-100 text-green-700" :
                item.quantity > 5 ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {item.quantity} in stock
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Added: {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Inventory Item">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Item Name" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            <Button type="submit">Add Item</Button>
          </form>
        </Modal>
      )}

      {showIssueModal && (
        <Modal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} title="Issue/Return Item">
          <form onSubmit={handleIssueReturn} className="space-y-4">
            <select value={issueData.action} onChange={(e) => setIssueData({ ...issueData, action: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="ISSUE">Issue</option>
              <option value="RETURN">Return</option>
            </select>
            <select value={issueData.itemId} onChange={(e) => setIssueData({ ...issueData, itemId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required>
              <option value="">Select Item</option>
              {items.map(item => <option key={item._id} value={item._id}>{item.itemName} ({item.quantity} available)</option>)}
            </select>
            <select value={issueData.userId} onChange={(e) => setIssueData({ ...issueData, userId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required>
              <option value="">Select Employee</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type="number" placeholder="Quantity" value={issueData.quantity} onChange={(e) => setIssueData({ ...issueData, quantity: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" required />
            <Button type="submit">{issueData.action === "ISSUE" ? "Issue" : "Return"} Item</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryPage;
