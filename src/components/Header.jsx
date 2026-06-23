import { FaBell, FaSearch, FaSignOutAlt } from "react-icons/fa";
import { FcAreaChart } from "react-icons/fc";
import { SlSettings } from "react-icons/sl";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex justify-between items-center bg-[#F8F9FB] px-6 py-4">
      {/* Search */}
      <div className="relative w-[420px]">
        <input
          type="text"
          placeholder="Search Here..."
          className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
        />
        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div className="relative bg-blue-100 p-2 rounded-xl cursor-pointer">
          <FaBell className="text-blue-600" />
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1.5 rounded-full">
            Active
          </span>
        </div>

        {/* Chart */}
        <div className="bg-gray-100 p-2 rounded-xl cursor-pointer">
          <FcAreaChart />
        </div>

        {/* Settings */}
        <div className="bg-red-100 p-2 rounded-xl cursor-pointer">
          <SlSettings className="text-red-500" />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right">
            <p className="text-sm text-gray-600 leading-tight">
              Hello, <b className="text-gray-800">{user?.name || "User"}</b>
            </p>
            <p className="text-[10px] text-gray-400 font-semibold">{user?.role || "Member"}</p>
          </div>
          <img
            src={user?.avatar_url || "/img/cs2.png"}
            alt="profile"
            className="w-11 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
            }}
          />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center text-white cursor-pointer transition shadow-sm hover:shadow"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </div>
  );
}