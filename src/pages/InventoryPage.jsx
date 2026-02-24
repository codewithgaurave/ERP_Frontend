import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { inventoryAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import Button from "../components/ui/Button";
import { Drawer } from "../components/ui/Drawer";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";

const InventoryPage = () => {
  const { user } = useAuth();
  const { openRightSidebar, closeRightSidebar, isRightSidebarOpen } =
    useSidebar();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // 'ADD' or 'ISSUE'
  const [formData, setFormData] = useState({ itemName: "", quantity: 0 });
  const [issueData, setIssueData] = useState({
    itemId: "",
    userId: "",
    quantity: 0,
    action: "ISSUE",
  });

  useEffect(() => {
    fetchItems();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isRightSidebarOpen) {
      updateRightSidebar();
    }
  }, [
    formData,
    issueData,
    formLoading,
    activeForm,
    items,
    users,
    isRightSidebarOpen,
  ]);

  const updateRightSidebar = () => {
    openRightSidebar(
      <Drawer
        onClose={closeRightSidebar}
        title={activeForm === "ADD" ? "+ New Asset" : "Inventory Transaction"}
        footer={
          <div className="flex gap-3">
            <Button
              form="inventory-form"
              type="submit"
              className="flex-1 py-3.5 text-[10px] font-bold rounded uppercase tracking-[2px] shadow-lg shadow-brand-500/20 active:scale-[0.98]"
              disabled={formLoading}
            >
              {formLoading
                ? "Recording..."
                : activeForm === "ADD"
                  ? "Add Asset"
                  : issueData.action === "ISSUE"
                    ? "Authorize Issue"
                    : "Authorize Return"}
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
          id="inventory-form"
          onSubmit={activeForm === "ADD" ? handleSubmit : handleIssueReturn}
          className="space-y-6"
        >
          {activeForm === "ADD" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                  Asset Name
                </label>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                  Initial Stock
                </label>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-sm"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                  Action Type
                </label>
                <Select
                  options={[
                    { value: "ISSUE", label: "Asset Out (Issue)" },
                    { value: "RETURN", label: "Asset In (Return)" },
                  ]}
                  value={issueData.action}
                  onChange={(val) =>
                    setIssueData({ ...issueData, action: val })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                  Select Asset
                </label>
                <Select
                  options={[
                    { value: "", label: "Choose item..." },
                    ...items.map((item) => ({
                      value: item._id,
                      label: `${item.itemName} (${item.quantity} in stock)`,
                    })),
                  ]}
                  value={issueData.itemId}
                  onChange={(val) =>
                    setIssueData({ ...issueData, itemId: val })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                  Personnel
                </label>
                <Select
                  options={[
                    { value: "", label: "Assign to..." },
                    ...users.map((u) => ({ value: u._id, label: u.name })),
                  ]}
                  value={issueData.userId}
                  onChange={(val) =>
                    setIssueData({ ...issueData, userId: val })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                  Units
                </label>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={issueData.quantity}
                  onChange={(e) =>
                    setIssueData({ ...issueData, quantity: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none font-semibold text-xs"
                  required
                />
              </div>
            </>
          )}
        </form>
      </Drawer>,
    );
  };
  streams;

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await inventoryAPI.getAll();
      setItems(data.items);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load inventory");
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
      setFormLoading(true);
      await inventoryAPI.addItem(formData);
      closeRightSidebar();
      setFormData({ itemName: "", quantity: 0 });
      toast.success("Item added to stock");
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding item");
    } finally {
      setFormLoading(false);
    }
  };

  const handleIssueReturn = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (issueData.action === "ISSUE") {
        await inventoryAPI.issue(issueData);
        toast.success("Item issued successfully");
      } else {
        await inventoryAPI.return(issueData);
        toast.success("Item returned successfully");
      }
      closeRightSidebar();
      setIssueData({ itemId: "", userId: "", quantity: 0, action: "ISSUE" });
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing request");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">
            Inventory Management
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold tracking-widest uppercase">
            Resource Allocation & Stock Assets
          </p>
        </div>
        <div className="flex gap-3">
          {(user.role === "ADMIN" || user.role === "INVENTORY") && (
            <>
              <Button
                onClick={() => {
                  setActiveForm("ADD");
                  openRightSidebar(null);
                }}
                size="sm"
                className="rounded shadow-lg shadow-brand-500/20"
              >
                + Add Item
              </Button>
              <Button
                onClick={() => {
                  setActiveForm("ISSUE");
                  openRightSidebar(null);
                }}
                size="sm"
                variant="outline"
                className="rounded"
              >
                Issue/Return
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 rounded bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 animate-pulse"
              ></div>
            ))
        ) : items.length === 0 ? (
          <div className="col-span-full py-20 text-center uppercase tracking-[4px] font-black text-[10px] text-slate-400 opacity-40 italic">
            No assets found
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-slate-100 dark:border-gray-700 hover:border-brand-200 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                  {item.itemName}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    item.quantity > 10
                      ? "bg-emerald-100 text-emerald-700"
                      : item.quantity > 5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.quantity} Units Stock
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-gray-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Recorded On
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
