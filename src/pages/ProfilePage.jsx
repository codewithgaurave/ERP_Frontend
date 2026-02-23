import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
            <p className="text-slate-600 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-slate-200 dark:border-gray-700">
            <span className="font-semibold text-slate-600 dark:text-gray-400">Role</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              user?.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
              user?.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
              user?.role === "HR" ? "bg-green-100 text-green-700" :
              user?.role === "INVENTORY" ? "bg-orange-100 text-orange-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {user?.role}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-slate-200 dark:border-gray-700">
            <span className="font-semibold text-slate-600 dark:text-gray-400">Salary</span>
            <span className="font-bold text-slate-800 dark:text-white">₹{user?.salary}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-slate-200 dark:border-gray-700">
            <span className="font-semibold text-slate-600 dark:text-gray-400">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              user?.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {user?.status ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="font-semibold text-slate-600 dark:text-gray-400">Last Login</span>
            <span className="text-slate-800 dark:text-white">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
