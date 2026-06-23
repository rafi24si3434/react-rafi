import React, { useEffect, useState } from "react";
import {
  FaShoppingCart,
  FaBan,
  FaDollarSign,
  FaCrown,
  FaAward,
  FaArrowRight,
  FaPlus,
  FaUtensils,
  FaCoins,
  FaChevronRight,
  FaUserAstronaut,
  FaClock,
  FaTruck,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function StatCard({ icon, value, label, bg, border }) {
  return (
    <div className={`bg-white rounded-3xl p-5 flex items-center gap-4 border ${border || "border-slate-100"} shadow-sm hover:shadow-md transition duration-300 group`}>
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-2xl ${bg} text-white text-lg group-hover:scale-110 transition duration-300`}
      >
        {icon}
      </div>

      <div>
        <p className="text-xl font-bold text-slate-800 leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  // State for admin stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalDelivered: 0,
    totalCanceled: 0,
    totalRevenue: 0,
  });
  const [adminChartData, setAdminChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for member dashboard
  const [memberOrders, setMemberOrders] = useState([]);
  const [memberStats, setMemberStats] = useState({
    lifetimeSpent: 0,
    activeOrdersCount: 0,
    completedOrdersCount: 0,
  });
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Time greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        if (isAdmin) {
          // Fetch stats for Admin
          const { data: allOrders, error: ordersErr } = await supabase
            .from("orders")
            .select("status, total_final, created_at");

          if (!ordersErr && allOrders) {
            const total = allOrders.length;
            const delivered = allOrders.filter(o => o.status === "Completed").length;
            const canceled = allOrders.filter(o => o.status === "Cancelled").length;
            const revenue = allOrders
              .filter(o => o.status === "Completed")
              .reduce((sum, o) => sum + Number(o.total_final), 0);

            setStats({
              totalOrders: total,
              totalDelivered: delivered,
              totalCanceled: canceled,
              totalRevenue: revenue,
            });

            // Format data for chart by month
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formatted = Array(6).fill(0).map((_, idx) => {
              const d = new Date();
              d.setMonth(d.getMonth() - (5 - idx));
              const mName = months[d.getMonth()];
              const mIdx = d.getMonth();
              const y = d.getFullYear();

              const monthlyOrders = allOrders.filter(o => {
                const od = new Date(o.created_at);
                return od.getMonth() === mIdx && od.getFullYear() === y;
              });

              const revenueSum = monthlyOrders
                .filter(o => o.status === "Completed")
                .reduce((sum, o) => sum + Number(o.total_final), 0);

              return {
                name: mName,
                orders: monthlyOrders.length,
                revenue: revenueSum / 1000, // in thousands for display
              };
            });

            setAdminChartData(formatted);
          }
        } else {
          // Member dashboard queries
          // 1. Fetch personal orders
          const { data: orders, error: ordersErr } = await supabase
            .from("orders")
            .select("*")
            .eq("member_id", user?.id)
            .order("created_at", { ascending: false });

          if (!ordersErr && orders) {
            setMemberOrders(orders.slice(0, 4));

            const completed = orders.filter(o => o.status === "Completed");
            const active = orders.filter(o => o.status === "Pending");
            const totalSpent = completed.reduce((sum, o) => sum + Number(o.total_final), 0);

            setMemberStats({
              lifetimeSpent: totalSpent,
              activeOrdersCount: active.length,
              completedOrdersCount: completed.length,
            });
          }

          // 2. Fetch 3 recommended products (special menu)
          const { data: products, error: prodsErr } = await supabase
            .from("products")
            .select("*")
            .gt("stock", 0)
            .limit(3);

          if (!prodsErr && products) {
            setRecommendedProducts(products);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, isAdmin]);

  // Member Tier styling helper
  const getTierDetails = (tier) => {
    switch (tier) {
      case "Platinum":
        return {
          bg: "from-[#0f172a] via-[#3b0764] to-[#1e1b4b]",
          text: "text-purple-100",
          accent: "text-purple-300",
          badge: "bg-purple-500/20 border-purple-400 text-purple-300",
          discount: 20,
          pointsNeeded: 0,
          glow: "shadow-purple-500/20",
          iconColor: "text-purple-400",
        };
      case "Gold":
        return {
          bg: "from-[#78350f] via-[#d97706] to-[#b45309]",
          text: "text-amber-50",
          accent: "text-yellow-200",
          badge: "bg-yellow-500/20 border-yellow-400 text-yellow-100",
          discount: 15,
          pointsNeeded: 5000,
          glow: "shadow-yellow-500/20",
          iconColor: "text-yellow-400",
        };
      case "Silver":
        return {
          bg: "from-[#334155] via-[#64748b] to-[#475569]",
          text: "text-slate-50",
          accent: "text-slate-200",
          badge: "bg-slate-500/20 border-slate-400 text-slate-100",
          discount: 10,
          pointsNeeded: 1500,
          glow: "shadow-slate-500/20",
          iconColor: "text-slate-300",
        };
      default: // Bronze
        return {
          bg: "from-[#8c2e0b] via-[#c2410c] to-[#9a3412]",
          text: "text-orange-50",
          accent: "text-orange-300",
          badge: "bg-orange-500/20 border-orange-400 text-orange-200",
          discount: 5,
          pointsNeeded: 500,
          glow: "shadow-orange-500/20",
          iconColor: "text-orange-400",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // ================= ADMIN VIEW =================
  if (isAdmin) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Global sales, operations, and customers analytics</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/customers/add")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 text-sm font-semibold cursor-pointer"
            >
              <FaPlus className="text-xs" /> Add Customer
            </button>

            <button
              onClick={() => navigate("/orders/add")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 text-sm font-semibold cursor-pointer"
            >
              <FaPlus className="text-xs" /> Add Order
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-4">
          <StatCard icon={<FaShoppingCart />} value={stats.totalOrders} label="Total Orders" bg="bg-gradient-to-br from-green-400 to-emerald-500" />
          <StatCard icon={<FaTruck />} value={stats.totalDelivered} label="Completed Orders" bg="bg-gradient-to-br from-blue-400 to-cyan-500" />
          <StatCard icon={<FaBan />} value={stats.totalCanceled} label="Cancelled Orders" bg="bg-gradient-to-br from-red-400 to-orange-500" />
          <StatCard icon={<FaDollarSign />} value={`Rp ${stats.totalRevenue.toLocaleString()}`} label="Total Revenue" bg="bg-gradient-to-br from-yellow-400 to-amber-500" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Line Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Orders Overview
            </h2>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adminChartData.length > 0 ? adminChartData : [
                  { name: "Jan", orders: 0 },
                  { name: "Feb", orders: 0 },
                  { name: "Mar", orders: 0 },
                  { name: "Apr", orders: 0 },
                  { name: "May", orders: 0 },
                  { name: "Jun", orders: 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Revenue Overview (in thousands Rp)
            </h2>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminChartData.length > 0 ? adminChartData : [
                  { name: "Jan", revenue: 0 },
                  { name: "Feb", revenue: 0 },
                  { name: "Mar", revenue: 0 },
                  { name: "Apr", revenue: 0 },
                  { name: "May", revenue: 0 },
                  { name: "Jun", revenue: 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= MEMBER VIEW =================
  const td = getTierDetails(user?.tier);
  const currentPoints = user?.points || 0;
  const progressPercent = td.pointsNeeded > 0 ? Math.min((currentPoints / td.pointsNeeded) * 100, 100) : 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">My Member Area</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your loyalty status and track orders</p>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          icon={<FaCoins />} 
          value={`${currentPoints} PTS`} 
          label="Active Loyalty Points" 
          bg="bg-gradient-to-br from-yellow-400 to-amber-500" 
        />
        <StatCard 
          icon={<FaShoppingCart />} 
          value={memberStats.activeOrdersCount} 
          label="Active Pending Orders" 
          bg="bg-gradient-to-br from-blue-400 to-cyan-500" 
        />
        <StatCard 
          icon={<FaUtensils />} 
          value={memberStats.completedOrdersCount} 
          label="Completed Orders" 
          bg="bg-gradient-to-br from-emerald-400 to-teal-500" 
        />
        <StatCard 
          icon={<FaDollarSign />} 
          value={`Rp ${memberStats.lifetimeSpent.toLocaleString()}`} 
          label="Lifetime Spendings" 
          bg="bg-gradient-to-br from-purple-400 to-pink-500" 
        />
      </div>

      {/* 3. LOYALTY CARD & PROGRESS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VIP Credit Card Component */}
        <div className={`lg:col-span-1 bg-gradient-to-r ${td.bg} rounded-[32px] p-7 shadow-2xl ${td.glow} text-white flex flex-col justify-between h-64 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]`}>
          <div className="absolute right-[-20px] bottom-[-20px] w-52 h-52 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute left-[-20px] top-[-20px] w-32 h-32 bg-white/5 rounded-full blur-lg pointer-events-none" />

          {/* Top Line */}
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">Sedap Restaurant VIP</p>
              <h3 className="text-2xl font-bold mt-1 tracking-wide">{user?.name}</h3>
            </div>
            <span className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-xl border tracking-wide ${td.badge}`}>
              {user?.tier}
            </span>
          </div>

          {/* Card Middle: NFC Chip & Card Numbers mock */}
          <div className="flex justify-between items-center my-2 z-10">
            {/* Mock Gold Chip */}
            <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-lg relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 border border-amber-600/30 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-amber-600/20" />
                <div className="border-r border-b border-amber-600/20" />
                <div className="border-b border-amber-600/20" />
              </div>
            </div>
            {/* Mock Card Number */}
            <p className="font-mono text-sm tracking-[3px] opacity-80">•••• •••• •••• {user?.id?.substring(0,4).toUpperCase()}</p>
          </div>

          {/* Bottom Line */}
          <div className="flex justify-between items-end border-t border-white/10 pt-4 z-10">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/60">Points Balance</p>
              <p className="text-3xl font-black mt-0.5 tracking-tight">{currentPoints} <span className="text-xs font-medium opacity-85">PTS</span></p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/60">Discount benefit</p>
              <p className="text-lg font-bold text-yellow-300">{td.discount}% OFF</p>
            </div>
          </div>
        </div>

        {/* Loyalty Milestones & Tier Progress Status */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-7 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaAward className="text-yellow-500 text-xl" /> Tier Progress Status
            </h3>
            
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              You are currently a <span className="font-bold text-emerald-600">{user?.tier} Member</span>. Maintain your loyalty points or gain more to advance to higher tiers and unlock premium discounts.
            </p>

            {td.pointsNeeded > 0 ? (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-full">{currentPoints} PTS</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">Next Tier: {td.pointsNeeded} PTS ({td.nextTier})</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-inner"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <FaClock className="text-slate-300" />
                  <span>Need <b className="text-slate-600 font-bold">{td.pointsNeeded - currentPoints}</b> more points to automatically unlock <b className="text-emerald-600 font-bold">{td.nextTier}</b> status benefits.</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 rounded-2xl text-purple-900 text-sm font-semibold flex items-center gap-3">
                <FaCrown className="text-yellow-500 text-2xl animate-bounce" />
                <div>
                  <p className="font-bold">Platinum Tier Unlocked! 🎉</p>
                  <p className="text-xs text-purple-700 mt-0.5 font-medium">You have achieved maximum tier level. Enjoy 20% discount on every food order lifetime!</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-slate-50">
            {[
              { t: "Bronze", pts: "0+", disc: "5%" },
              { t: "Silver", pts: "500+", disc: "10%" },
              { t: "Gold", pts: "1500+", disc: "15%" },
              { t: "Platinum", pts: "5000+", disc: "20%" }
            ].map((milestone) => {
              const isCurrent = user?.tier === milestone.t;
              return (
                <div 
                  key={milestone.t} 
                  className={`p-3 rounded-2xl text-center border transition-all duration-300 ${
                    isCurrent 
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 scale-105 shadow-sm" 
                      : "bg-slate-50/50 border-slate-100 text-slate-400"
                  }`}
                >
                  <p className={`text-xs font-bold ${isCurrent ? "text-emerald-700" : "text-slate-700"}`}>{milestone.t}</p>
                  <p className="text-[10px] mt-0.5 font-medium">{milestone.pts} PTS</p>
                  <span className={`inline-block mt-2 text-xs font-black px-2 py-0.5 rounded-lg ${
                    isCurrent ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {milestone.disc} OFF
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. RECOMMENDED PRODUCTS CARD BLOCK */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg text-sm">🔥</span>
              Recommended Special Offers
            </h3>
            <button 
              onClick={() => navigate("/product")} 
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
            >
              Browse Catalog <FaChevronRight className="text-[9px]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedProducts.map((p) => (
              <div 
                key={p.id} 
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between group"
              >
                <div className="relative overflow-hidden h-44">
                  <img 
                    src={p.image_url || "https://images.unsplash.com/photo-1546435770-a3e426bf472b"} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                    {p.category}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base leading-snug line-clamp-1 group-hover:text-emerald-600 transition">
                      {p.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{p.brand}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {p.description || "Premium food and beverage products selected for you."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Special Price</p>
                      <p className="text-base font-black text-slate-800">Rp {Number(p.price).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => navigate("/orders/add")}
                      className="bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white font-bold text-xs p-3 rounded-2xl transition duration-300 flex items-center justify-center cursor-pointer shadow-sm shadow-emerald-500/5 hover:scale-105"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. RECENT ORDERS TABLE */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-sm">📋</span>
            My Recent Orders History
          </h3>
          <button 
            onClick={() => navigate("/orders")}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition flex items-center gap-1"
          >
            View All History <FaChevronRight className="text-[9px]" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Original Subtotal</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Discount Applied</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Final Price Paid</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Order Date</th>
              </tr>
            </thead>
            <tbody>
              {memberOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100/50 hover:bg-slate-50/30 transition last:border-b-0">
                  <td className="px-6 py-4 font-mono font-bold text-slate-600">
                    #{o.id.substring(0, 8).toUpperCase()}...
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    Rp {Number(o.total_original).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-red-500 font-medium">
                    -Rp {Number(o.discount_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-black">
                    Rp {Number(o.total_final).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      o.status === "Completed"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : o.status === "Pending"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(o.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </td>
                </tr>
              ))}

              {memberOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 italic">
                    You haven't made any orders yet. Click "Order Food Now" to place your first order!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}