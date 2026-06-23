import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTrashAlt,
  FaBoxOpen,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const ITEMS_PER_PAGE = 5;

// ✅ Stock Badge
function StockBadge({ stock }) {
  const styles =
    stock > 20
      ? "bg-green-100 text-green-700 border border-green-200"
      : stock > 10
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : "bg-red-100 text-red-600 border border-red-200";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}
    >
      {stock} Stock
    </span>
  );
}

// ✅ Table Row
function TableRow({
  id,
  title,
  code,
  category,
  brand,
  price,
  stock,
  isAdmin,
  onDelete,
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-green-50/40 transition duration-200">

      <td className="px-6 py-5 text-gray-500 font-medium">
        #{id.substring(0, 8)}...
      </td>

      <td className="px-6 py-5">
        <div>
          {/* LINK KE PRODUCT DETAIL */}
          <Link
            to={`/products/${id}`}
            className="font-semibold text-gray-800 hover:text-green-600 transition"
          >
            {title}
          </Link>
          <p className="text-xs text-gray-400">
            Product Item
          </p>
        </div>
      </td>

      <td className="px-6 py-5 text-gray-500">
        {code}
      </td>

      <td className="px-6 py-5 text-gray-500">
        {category}
      </td>

      <td className="px-6 py-5 text-gray-500">
        {brand}
      </td>

      <td className="px-6 py-5 text-gray-700 font-medium">
        Rp {Number(price).toLocaleString()}
      </td>

      <td className="px-6 py-5">
        <StockBadge stock={stock} />
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <Link 
            to={`/products/${id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-medium transition"
          >
            <FaEye />
            View
          </Link>

          {isAdmin && (
            <button 
              onClick={() => onDelete(id)}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium transition"
            >
              <FaTrashAlt />
              Delete
            </button>
          )}
        </div>
      </td>

    </tr>
  );
}

export default function Product() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // format to match UI field expectations
      const formatted = (data || []).map(p => ({
        id: p.id,
        title: p.name,
        code: p.code,
        category: p.category,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
      }));

      setProductsList(formatted);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      fetchProducts();
    } catch (err) {
      alert("Gagal menghapus produk: " + err.message);
    }
  };

  // ✅ FILTER DATA
  const filtered = productsList.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
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
            Product
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your product data easily
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate("/product/add")}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl shadow-md transition"
          >
            <FaBoxOpen />
            Add Product
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 w-96">
        <input
          type="text"
          placeholder="Search product..."
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
          <div className="text-center py-12 text-gray-500">Loading products data...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-green-50 to-white text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-5 font-semibold">ID</th>
                <th className="px-6 py-5 font-semibold">Product</th>
                <th className="px-6 py-5 font-semibold">Code</th>
                <th className="px-6 py-5 font-semibold">Category</th>
                <th className="px-6 py-5 font-semibold">Brand</th>
                <th className="px-6 py-5 font-semibold">Price</th>
                <th className="px-6 py-5 font-semibold">Stock</th>
                <th className="px-6 py-5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((p) => (
                <TableRow 
                  key={p.id} 
                  {...p} 
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                />
              ))}

              {currentData.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-12 text-gray-400"
                  >
                    No product found
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