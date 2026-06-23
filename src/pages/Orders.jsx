import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTrashAlt,
  FaShoppingCart,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const ITEMS_PER_PAGE = 5;

// ✅ Status Badge
function StatusBadge({ status }) {
  const styles =
    status === "Completed"
      ? "bg-green-100 text-green-700 border border-green-200"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : "bg-red-100 text-red-600 border border-red-200";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

// ✅ Table Row
function TableRow({
  id,
  customer,
  total,
  status,
  date,
  image,
  isAdmin,
  onCancel,
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-green-50/40 transition duration-200">

      {/* ID */}
      <td className="px-6 py-5 text-gray-500 font-medium">
        #{id.substring(0, 8)}...
      </td>

      {/* CUSTOMER */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          {/* FOTO */}
          <img
            src={image || "https://randomuser.me/api/portraits/lego/1.jpg"}
            alt={customer}
            className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
            }}
          />

          {/* INFO */}
          <div>
            <Link
              to={`/orders/${id}`}
              className="font-semibold text-gray-800 hover:text-green-600 transition"
            >
              {customer}
            </Link>
            <p className="text-xs text-gray-400">
              Active Customer
            </p>
          </div>
        </div>
      </td>

      {/* TOTAL */}
      <td className="px-6 py-5 text-gray-600 font-medium">
        Rp {Number(total).toLocaleString()}
      </td>

      {/* STATUS */}
      <td className="px-6 py-5">
        <StatusBadge status={status} />
      </td>

      {/* DATE */}
      <td className="px-6 py-5 text-gray-500">
        {date}
      </td>

      {/* ACTION */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <Link
            to={`/orders/${id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-medium transition"
          >
            <FaEye />
            View
          </Link>

          {isAdmin && status !== "Cancelled" && (
            <button 
              onClick={() => onCancel(id)}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium transition"
            >
              <FaTrashAlt />
              Cancel
            </button>
          )}
        </div>
      </td>

    </tr>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select(`
          *,
          profiles:member_id (
            name,
            avatar_url
          )
        `);

      if (!isAdmin) {
        query = query.eq("member_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map(o => ({
        id: o.id,
        customer: o.profiles?.name || "Unknown Customer",
        total: o.total_final,
        status: o.status,
        date: new Date(o.created_at).toLocaleDateString(),
        image: o.profiles?.avatar_url,
      }));

      setOrdersList(formatted);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Yakin ingin membatalkan pesanan ini?")) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "Cancelled" })
        .eq("id", orderId);

      if (error) throw error;
      fetchOrders();
    } catch (err) {
      alert("Gagal membatalkan pesanan: " + err.message);
    }
  };

  // ✅ FILTER DATA
  const filtered = ordersList.filter((o) =>
    o.customer.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ PAGINATION
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filtered.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="p-6 bg-[#F8F9FB] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Orders
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your orders data easily
          </p>
        </div>

        <button
          onClick={() => navigate("/orders/add")}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl shadow-md transition"
        >
          <FaShoppingCart />
          Add Order
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 w-96">
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-white pl-11 pr-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none text-sm"
        />
        <FaSearch className="absolute left-4 top-4 text-gray-400 text-sm" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading orders data...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-green-50 to-white text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-5 font-semibold">Order ID</th>
                <th className="px-6 py-5 font-semibold">Customer</th>
                <th className="px-6 py-5 font-semibold">Total</th>
                <th className="px-6 py-5 font-semibold">Status</th>
                <th className="px-6 py-5 font-semibold">Date</th>
                <th className="px-6 py-5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((o) => (
                <TableRow 
                  key={o.id} 
                  {...o} 
                  isAdmin={isAdmin}
                  onCancel={handleCancelOrder}
                />
              ))}

              {currentData.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-12 text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-500">
          Showing page {currentPage} of {totalPages}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-xl shadow-sm hover:bg-green-600 disabled:opacity-50 transition"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

    </div>
  );
}