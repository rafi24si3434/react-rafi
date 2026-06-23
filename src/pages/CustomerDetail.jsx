import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhoneAlt,
  FaCrown,
  FaUserCircle,
  FaStar,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerDetail() {
      setLoading(true);
      try {
        // Fetch customer profile
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileErr) throw profileErr;

        setCustomer({
          ...profile,
          loyalty: profile.tier,
          image: profile.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg",
        });

        // Fetch customer orders history
        const { data: customerOrders, error: ordersErr } = await supabase
          .from("orders")
          .select("*")
          .eq("member_id", id)
          .order("created_at", { ascending: false });

        if (!ordersErr) {
          setOrders(customerOrders || []);
        }
      } catch (err) {
        console.error("Error loading customer detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-3 text-gray-500">Loading customer information...</p>
      </div>
    );
  }

  // JIKA DATA TIDAK ADA
  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB]">
        <h1 className="text-4xl font-bold text-red-500">
          Customer Not Found
        </h1>

        <button
          onClick={() => navigate("/customers")}
          className="mt-5 px-5 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  // STYLE BADGE
  const loyaltyStyle =
    customer.loyalty === "Gold"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : customer.loyalty === "Silver"
      ? "bg-slate-100 text-slate-700 border border-slate-200"
      : customer.loyalty === "Platinum"
      ? "bg-purple-100 text-purple-700 border border-purple-200"
      : "bg-orange-100 text-orange-700 border border-orange-200";

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Customer Detail
          </h1>
          <p className="text-gray-400 mt-1">
            Complete customer information & activity history
          </p>
        </div>

        <button
          onClick={() => navigate("/customers")}
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
                  src={customer.image}
                  alt={customer.name}
                  className="w-72 h-72 object-cover rounded-2xl"
                  onError={(e) => {
                    e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                  }}
                />
              </div>
            </div>

            {/* INFO */}
            <div>
              <p className="uppercase tracking-widest text-green-100 text-sm mb-3">
                Customer Member
              </p>

              <h1 className="text-5xl font-bold leading-tight">
                {customer.name}
              </h1>

              <p className="mt-4 text-lg text-green-50">
                Customer ID : #{customer.id.substring(0, 8)}...
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span
                  className={`px-5 py-3 rounded-full text-sm font-semibold bg-white ${loyaltyStyle}`}
                >
                  {customer.loyalty} Member
                </span>
                
                <span className="px-5 py-3 rounded-full text-sm font-semibold bg-white text-gray-800 border border-gray-200">
                  ⭐️ {customer.points} PTS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* EMAIL */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
                <FaEnvelope />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Email Address
                </p>
                <h2 className="text-lg font-bold text-gray-800 break-all">
                  {customer.email}
                </h2>
              </div>
            </div>
          </div>

          {/* PHONE */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl">
                <FaPhoneAlt />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Phone Number
                </p>
                <h2 className="text-lg font-bold text-gray-800">
                  {customer.phone || "-"}
                </h2>
              </div>
            </div>
          </div>

          {/* LOYALTY */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-2xl">
                <FaCrown />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Loyalty Status
                </p>
                <h2 className="text-lg font-bold text-gray-800">
                  {customer.loyalty} ({customer.points} Points)
                </h2>
              </div>
            </div>
          </div>

        </div>

        {/* DESCRIPTION */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaUserCircle className="text-2xl text-green-600" />
              <h1 className="text-2xl font-bold text-green-700">
                Customer Information
              </h1>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              <span className="font-semibold text-gray-800">
                {customer.name}
              </span>{" "}
              is registered as a{" "}
              <span className="font-semibold text-gray-800">
                {customer.loyalty}
              </span>{" "}
              member customer. The registered email address is{" "}
              <span className="font-semibold text-gray-800">
                {customer.email}
              </span>
              {customer.phone && (
                <>
                  {" "}and the active phone number is{" "}
                  <span className="font-semibold text-gray-800">
                    {customer.phone}
                  </span>
                </>
              )}
              .
            </p>
          </div>
        </div>

      </div>

      {/* CUSTOMER TRANSACTION HISTORY */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaStar className="text-emerald-500" /> Order History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FB] text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Total Price</th>
                <th className="px-6 py-4 font-semibold">Discount Amount</th>
                <th className="px-6 py-4 font-semibold">Final Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-green-50/10 transition">
                  <td className="px-6 py-4 font-medium text-gray-600">
                    #{o.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    Rp {Number(o.total_original).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-red-500 font-medium">
                    -Rp {Number(o.discount_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-bold">
                    Rp {Number(o.total_final).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      o.status === "Completed"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : o.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-red-100 text-red-600 border border-red-200"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No orders recorded for this customer.
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