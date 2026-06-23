import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaShoppingCart } from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function AddOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  // List of products fetched from Supabase
  const [dbProducts, setDbProducts] = useState([]);
  // List of customer profiles (for admin to select)
  const [customers, setCustomers] = useState([]);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedProductIndex, setSelectedProductIndex] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [orderStatus, setOrderStatus] = useState("Pending");

  // Selected customer details (for discount rates)
  const [targetCustomer, setTargetCustomer] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch products
        const { data: prods, error: prodsErr } = await supabase
          .from("products")
          .select("*")
          .gt("stock", 0) // only products in stock
          .order("name");

        if (!prodsErr && prods) {
          setDbProducts(prods);
        }

        // Fetch customers if Admin
        if (isAdmin) {
          const { data: custs, error: custsErr } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "Member")
            .order("name");

          if (!custsErr && custs) {
            setCustomers(custs);
          }
        } else {
          // If Member, target customer is they themselves
          setTargetCustomer(user);
          setSelectedCustomerId(user?.id);
        }
      } catch (err) {
        console.error("Error loading order creation dependencies:", err);
      }
    }

    if (user) {
      loadData();
    }
  }, [user, isAdmin]);

  // Load target customer details when changed (for Admins)
  useEffect(() => {
    async function fetchTargetCustomer() {
      if (isAdmin && selectedCustomerId) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", selectedCustomerId)
          .single();

        if (!error && data) {
          setTargetCustomer(data);
        }
      }
    }
    fetchTargetCustomer();
  }, [selectedCustomerId, isAdmin]);

  // Calculate discount percentage based on customer tier
  const getDiscountPercentage = (tier) => {
    switch (tier) {
      case "Platinum": return 20;
      case "Gold": return 15;
      case "Silver": return 10;
      case "Bronze": return 5;
      default: return 0;
    }
  };

  const discountRate = targetCustomer ? getDiscountPercentage(targetCustomer.tier) : 0;

  // Add product to items list
  const handleAddItem = () => {
    if (selectedProductIndex === "") return;
    const prod = dbProducts[selectedProductIndex];
    
    // Check if product is already added
    const existingIndex = orderItems.findIndex(item => item.product.id === prod.id);

    // Check stock
    const currentQty = existingIndex > -1 ? orderItems[existingIndex].quantity : 0;
    const newQty = currentQty + Number(selectedQuantity);

    if (newQty > prod.stock) {
      setError(`Stok tidak mencukupi! Sisa stok untuk ${prod.name} adalah ${prod.stock}.`);
      return;
    }

    setError("");

    if (existingIndex > -1) {
      // update qty
      const updated = [...orderItems];
      updated[existingIndex].quantity = newQty;
      setOrderItems(updated);
    } else {
      // add new item
      setOrderItems([...orderItems, { product: prod, quantity: Number(selectedQuantity) }]);
    }

    // Reset selectors
    setSelectedProductIndex("");
    setSelectedQuantity(1);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    const updated = orderItems.filter((_, idx) => idx !== index);
    setOrderItems(updated);
  };

  // Calculate prices
  const totalOriginal = orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = totalOriginal * (discountRate / 100);
  const totalFinal = totalOriginal - discountAmount;

  // Submit Order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCustomerId) {
      setError("Pilih Customer terlebih dahulu!");
      return;
    }

    if (orderItems.length === 0) {
      setError("Pilih minimal satu produk untuk dipesan!");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order summary row
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .insert([
          {
            member_id: selectedCustomerId,
            total_original: totalOriginal,
            discount_amount: discountAmount,
            total_final: totalFinal,
            status: orderStatus,
          },
        ])
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderId = orderData.id;

      // 2. Create order items and adjust product stocks
      for (const item of orderItems) {
        // Insert order item row
        const { error: itemErr } = await supabase
          .from("order_items")
          .insert([
            {
              order_id: orderId,
              product_id: item.product.id,
              quantity: item.quantity,
              price_at_purchase: item.product.price,
            },
          ]);

        if (itemErr) throw itemErr;

        // Reduce product stock
        const newStock = item.product.stock - item.quantity;
        const { error: stockErr } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product.id);

        if (stockErr) throw stockErr;
      }

      // If completing immediately by admin, reward points
      if (isAdmin && orderStatus === "Completed" && targetCustomer) {
        const pointsEarned = Math.floor(totalFinal / 10000);
        if (pointsEarned > 0) {
          const newPoints = (targetCustomer.points || 0) + pointsEarned;
          const newTier = ((pts) => {
            if (pts >= 5000) return "Platinum";
            if (pts >= 1500) return "Gold";
            if (pts >= 500) return "Silver";
            return "Bronze";
          })(newPoints);

          await supabase
            .from("profiles")
            .update({ points: newPoints, tier: newTier })
            .eq("id", selectedCustomerId);
        }
      }

      navigate("/orders");
    } catch (err) {
      setError(err.message || "Gagal menyimpan pesanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
      
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-lg">
          <FaShoppingCart />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Order</h1>
          <p className="text-sm text-gray-400">Initialize a new transaction order</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* CUSTOMER SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Customer</label>
            {isAdmin ? (
              <select
                name="customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm bg-gray-50 border-gray-200 cursor-pointer"
              >
                <option value="">Select Customer Member</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                readOnly
                value={user?.name || ""}
                className="w-full border px-3 py-2.5 rounded-xl bg-gray-100 border-gray-200 text-sm font-semibold text-gray-700 outline-none"
              />
            )}
          </div>

          {/* LOYALTY SUMMARY BLOCK */}
          {targetCustomer && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 flex justify-between items-center text-emerald-800 text-sm">
              <div>
                <p className="font-semibold">{targetCustomer.name}'s Loyalty Benefit</p>
                <p className="text-xs text-emerald-600 mt-0.5">Tier: {targetCustomer.tier} Member ({targetCustomer.points || 0} PTS)</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-emerald-600">{discountRate}%</span>
                <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">Discount Applied</p>
              </div>
            </div>
          )}
        </div>

        {/* PRODUCT SELECTOR WORKSPACE */}
        <div className="bg-[#F8F9FB] border border-gray-100 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-gray-800">Add Order Items</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Select Product</label>
              <select
                value={selectedProductIndex}
                onChange={(e) => setSelectedProductIndex(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm bg-white cursor-pointer"
              >
                <option value="">Select a product item</option>
                {dbProducts.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.name} - Rp {Number(p.price).toLocaleString()} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm h-10 cursor-pointer"
            >
              <FaPlus className="text-xs" /> Add Item
            </button>

          </div>
        </div>

        {/* ORDER ITEMS LIST TABLE */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FB] text-gray-600">
              <tr>
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-6 py-3 font-semibold text-right">Price</th>
                <th className="px-6 py-3 font-semibold text-center">Qty</th>
                <th className="px-6 py-3 font-semibold text-right">Total</th>
                <th className="px-6 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, idx) => (
                <tr key={item.product.id} className="border-b last:border-b-0 border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-700">{item.product.name}</td>
                  <td className="px-6 py-4 text-right text-gray-600">Rp {Number(item.product.price).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-gray-700 font-bold">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">Rp {(item.product.price * item.quantity).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-600 transition"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}

              {orderItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400 italic">No items added to order yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* STATUS & SUMMARY CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 items-start">
          
          {/* STATUS CONTROLLERS FOR ADMIN */}
          <div>
            {isAdmin ? (
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Status</label>
                <select
                  name="status"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-48 border border-gray-200 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm bg-gray-50 cursor-pointer"
                >
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic mt-4">
                Note: Pesanan baru akan diinisialisasi dalam status <span className="font-bold text-yellow-600">Pending</span> dan diverifikasi oleh Admin.
              </div>
            )}
          </div>

          {/* PRICES CALCULATIONS CARD */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Original Subtotal</span>
              <span className="font-semibold text-gray-800">Rp {totalOriginal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm text-red-500">
              <span>Loyalty Discount ({discountRate}%)</span>
              <span className="font-semibold">-Rp {discountAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-800 border-t border-gray-200 pt-3">
              <span>Final Total</span>
              <span className="text-green-600">Rp {totalFinal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* BUTTON WORKSPACE */}
        <div className="flex justify-end gap-2 pt-6">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/orders")}
            className="px-6 py-3 border rounded-2xl text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || orderItems.length === 0}
            className="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 disabled:opacity-50 text-sm font-semibold shadow-md transition h-12 flex items-center justify-center"
          >
            {loading ? "Processing..." : "Save Order"}
          </button>
        </div>

      </form>
    </div>
  );
}