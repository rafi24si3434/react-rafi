import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTag,
  FaLayerGroup,
  FaWarehouse,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProductDetail() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setProduct({
          ...data,
          title: data.name,
          image: data.image_url || "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
        });
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-3 text-gray-500">Loading product detail...</p>
      </div>
    );
  }

  // JIKA PRODUCT TIDAK ADA
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FB]">
        <h1 className="text-4xl font-bold text-red-500 mb-3">
          Product Not Found
        </h1>

        <button
          onClick={() => navigate("/product")}
          className="mt-4 px-5 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition"
        >
          Back to Product
        </button>
      </div>
    );
  }

  // STOCK STYLE
  const stockStyle =
    product.stock > 20
      ? "bg-green-100 text-green-700 border border-green-200"
      : product.stock > 10
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : "bg-red-100 text-red-600 border border-red-200";

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Product Detail
          </h1>
          <p className="text-gray-400 mt-1">
            Complete information about selected product
          </p>
        </div>

        <button
          onClick={() => navigate("/product")}
          className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm hover:bg-gray-50 transition"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* TOP SECTION */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 p-10 text-white">

          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* FOTO PRODUCT */}
            <div className="flex justify-center">
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full max-w-md h-80 object-cover rounded-2xl"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546435770-a3e426bf472b";
                  }}
                />
              </div>
            </div>

            {/* PRODUCT INFO */}
            <div>
              <p className="uppercase tracking-widest text-green-100 text-sm mb-3">
                {product.category}
              </p>

              <h1 className="text-5xl font-bold leading-tight">
                {product.title}
              </h1>

              <p className="mt-4 text-lg text-green-50">
                Product Code : {product.code}
              </p>

              <h2 className="text-4xl font-bold mt-6">
                Rp {Number(product.price).toLocaleString()}
              </h2>

              <div className="mt-6">
                <span
                  className={`px-5 py-3 rounded-full text-sm font-semibold bg-white ${stockStyle}`}
                >
                  {product.stock} Items Available
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* CATEGORY */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl">
                <FaLayerGroup />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Category
                </p>
                <h2 className="text-xl font-bold text-gray-800">
                  {product.category}
                </h2>
              </div>
            </div>
          </div>

          {/* BRAND */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
                <FaTag />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Brand
                </p>
                <h2 className="text-xl font-bold text-gray-800">
                  {product.brand}
                </h2>
              </div>
            </div>
          </div>

          {/* STOCK */}
          <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center text-2xl">
                <FaWarehouse />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Stock
                </p>
                <h2 className="text-xl font-bold text-gray-800">
                  {product.stock} PCS
                </h2>
              </div>
            </div>
          </div>

        </div>

        {/* DESCRIPTION */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-8">
            <h1 className="text-2xl font-bold text-green-700 mb-4">
              Product Information
            </h1>
            <p className="text-gray-600 leading-relaxed text-lg">
              <span className="font-semibold text-gray-800">
                {product.title}
              </span>{" "}
              is one of the premium products from{" "}
              <span className="font-semibold text-gray-800">
                {product.brand}
              </span>
              . This product belongs to the{" "}
              <span className="font-semibold text-gray-800">
                {product.category}
              </span>{" "}
              category and currently has{" "}
              <span className="font-semibold text-gray-800">
                {product.stock} items
              </span>{" "}
              available in stock.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}