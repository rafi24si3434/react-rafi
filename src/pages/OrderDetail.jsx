import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaUserCircle,
  FaShoppingBag,
  FaChevronDown,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function loadOrderDetail() {
    setLoading(true);
    try {
      // 1. Fetch order and customer details
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:member_id (*)
        `)
        .eq("id", id)
        .single();

      if (orderErr) throw orderErr;

      setOrder({
        ...orderData,
        customer: orderData.profiles?.name || "Unknown Customer",
        customerEmail: orderData.profiles?.email,
        customerPhone: orderData.profiles?.phone || "-",
        image: orderData.profiles?.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg",
      });

      // 2. Fetch order items
      const { data: itemsData, error: itemsErr } = await supabase
        .from("order_items")
        .select(`
          *,
          products (*)
        `)
        .eq("order_id", id);

      if (!itemsErr) {
        setItems(itemsData || []);
      }
    } catch (err) {
      console.error("Error loading order details:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadOrderDetail();
    }
  }, [id]);

  const calculateTier = (points) => {
    if (points >= 5000) return "Platinum";
    if (points >= 1500) return "Gold";
    if (points >= 500) return "Silver";
    return "Bronze";
  };

  const handleStatusChange = async (newStatus) => {
    if (!order || updating) return;
    setUpdating(true);

    try {
      const oldStatus = order.status;

      // 1. Update order status
      const { error: updateErr } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateErr) throw updateErr;

      // 2. If status was updated to Completed (and wasn't before), award points and check loyalty tiering
      if (newStatus === "Completed" && oldStatus !== "Completed") {
        // Award 1 point for every Rp 10.000 spent
        const pointsEarned = Math.floor(Number(order.total_final) / 10000);

        if (pointsEarned > 0) {
          // Fetch current customer profile points
          const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("points")
            .eq("id", order.member_id)
            .single();

          if (!profileErr && profile) {
            const newPoints = (profile.points || 0) + pointsEarned;
            const newTier = calculateTier(newPoints);

            // Update user profile points & tier
            await supabase
              .from("profiles")
              .update({ points: newPoints, tier: newTier })
              .eq("id", order.member_id);
          }
        }
      }

      await loadOrderDetail();
      alert(`Status pesanan berhasil diperbarui ke: ${newStatus}`);
    } catch (err) {
      alert("Gagal memperbarui status pesanan: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-3 text-gray-500">Loading order transaction details...</p>
      </div>
    );
  }

  // JIKA DATA TIDAK ADA
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB]">
        <h1 className="text-4xl font-bold text-red-500">
          Order Not Found
        </h1>

        <button
          onClick={() => navigate("/orders")}
          className="mt-5 px-5 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // STATUS STYLE
  const statusStyle =
    order.status === "Completed"
      ? "bg-green-100 text-green-700 border border-green-200"
      : order.status === "Pending"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : "bg-red-100 text-red-700 border border-red-200";

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Order Detail
          </h1>
          <p className="text-gray-400 mt-1">
            Complete order transaction information
          </p>
        </div>

        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm hover:bg-gray-50 transition"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* TOP SECTION */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 p-10 text-white">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* FOTO */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-3xl shadow-2xl">
                <img
                  src={order.image}
                  alt={order.customer}
                  className="w-72 h-72 object-cover rounded-2xl shadow"
                  onError={(e) => {
                    e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                  }}
                />
              </div>
            </div>

            {/* INFO */}
            <div>
              <p className="uppercase tracking-widest text-green-100 text-sm mb-3">
                Order Transaction
              </p>

              <h1 className="text-5xl font-bold leading-tight">
                {order.customer}
              </h1>

              <p className="mt-4 text-lg text-green-50">
                Order ID : #{order.id}
              </p>

              <h2 className="text-4xl font-bold mt-6">
                Rp {Number(order.total_final).toLocaleString()}
              </h2>

              <div className="mt-6 flex flex-wrap gap-4 items-center">
                <span
                  className={`px-5 py-3 rounded-full text-sm font-semibold bg-white ${statusStyle}`}
                >
                  {order.status}
                </span>

                {/* ADMIN STATUS CONTROLLERS */}
                {isAdmin && (
                  <div className="relative inline-block text-left">
                    <select
                      value={order.status}
                      disabled={updating}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-gray-800 text-white font-semibold text-sm px-4 py-3 rounded-full border border-gray-700 outline-none cursor-pointer hover:bg-gray-700 transition"
                    >
                      <option value="Pending">Set status: Pending</option>
                      <option value="Completed">Set status: Completed</option>
                      <option value="Cancelled">Set status: Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* CUSTOMER */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
                <FaUserCircle />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Customer Email
                </p>
                <h2 className="text-base font-bold text-gray-800 break-all">
                  {order.customerEmail}
                </h2>
              </div>
            </div>
          </div>

          {/* TOTAL */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl">
                <FaMoneyBillWave />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Total Payment
                </p>
                <h2 className="text-lg font-bold text-gray-800">
                  Rp {Number(order.total_final).toLocaleString()}
                </h2>
                <p className="text-xs text-gray-400">
                  Discount: Rp {Number(order.discount_amount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-2xl">
                <FaClipboardCheck />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Order Status
                </p>
                <h2 className="text-lg font-bold text-gray-800">
                  {order.status}
                </h2>
              </div>
            </div>
          </div>

        </div>

        {/* DATE CARD */}
        <div className="px-8">
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center text-2xl">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                Transaction Date
              </p>
              <h2 className="text-xl font-bold text-gray-800">
                {new Date(order.created_at).toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        {/* ORDER ITEMS LIST */}
        <div className="p-8">
          <div className="border border-gray-100 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaShoppingBag className="text-emerald-500" /> Ordered Items List
            </h3>
            
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-gray-500 text-sm">
                      <th className="pb-3 font-semibold">Product Name</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold text-right">Price</th>
                      <th className="pb-3 font-semibold text-center">Qty</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-b-0">
                        <td className="py-3 font-medium text-gray-800">{item.products?.name}</td>
                        <td className="py-3 text-gray-500 text-sm">{item.products?.category}</td>
                        <td className="py-3 text-right text-gray-600">Rp {Number(item.price_at_purchase).toLocaleString()}</td>
                        <td className="py-3 text-center text-gray-600 font-bold">{item.quantity}</td>
                        <td className="py-3 text-right font-bold text-gray-800">Rp {(Number(item.price_at_purchase) * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No details for ordered items available.</p>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaShoppingBag className="text-2xl text-green-600" />
              <h1 className="text-2xl font-bold text-green-700">
                Order Information Summary
              </h1>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              Order transaction from{" "}
              <span className="font-semibold text-gray-800">
                {order.customer}
              </span>{" "}
              has a total original cost of{" "}
              <span className="font-semibold text-gray-800">
                Rp {Number(order.total_original).toLocaleString()}
              </span>
              , with a loyalty tier discount of{" "}
              <span className="font-semibold text-red-600">
                Rp {Number(order.discount_amount).toLocaleString()}
              </span>{" "}
              applied. The final amount of{" "}
              <span className="font-semibold text-gray-800">
                Rp {Number(order.total_final).toLocaleString()}
              </span>{" "}
              is currently marked as{" "}
              <span className="font-bold text-emerald-700">{order.status}</span>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}