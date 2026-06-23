import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    code: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // VALIDASI
    if (
      !form.title ||
      !form.code ||
      !form.category ||
      !form.brand ||
      !form.price ||
      !form.stock
    ) {
      setError("Semua field wajib diisi!");
      return;
    }

    const priceNum = Number(form.price);
    const stockNum = parseInt(form.stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setError("Harga harus berupa angka positif!");
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setError("Stok harus berupa angka positif!");
      return;
    }

    setLoading(true);

    const categoryImages = {
      Mouse: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7",
      Keyboard: "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
      Monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
      Headset: "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
    };

    const imageUrl = categoryImages[form.category] || "https://images.unsplash.com/photo-1546435770-a3e426bf472b";

    try {
      const { error: insertError } = await supabase
        .from("products")
        .insert([
          {
            name: form.title,
            code: form.code,
            category: form.category,
            brand: form.brand,
            price: priceNum,
            stock: stockNum,
            image_url: imageUrl,
            description: `${form.title} is a premium ${form.category} from ${form.brand}.`,
          },
        ]);

      if (insertError) throw insertError;

      // kembali ke halaman product
      navigate("/product");
    } catch (err) {
      setError(err.message || "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">

      <h1 className="text-2xl font-semibold mb-4">
        Add Product
      </h1>

      {error && (
        <div className="mb-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {/* TITLE */}
        <div>
          <label className="text-sm text-gray-600">
            Product Title
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter product title"
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          />
        </div>

        {/* CODE */}
        <div>
          <label className="text-sm text-gray-600">
            Product Code
          </label>

          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Contoh: PRD-101"
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="text-sm text-gray-600">
            Category
          </label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          >
            <option value="">Select Category</option>
            <option>Mouse</option>
            <option>Keyboard</option>
            <option>Monitor</option>
            <option>Headset</option>
          </select>
        </div>

        {/* BRAND */}
        <div>
          <label className="text-sm text-gray-600">
            Brand
          </label>

          <input
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Enter product brand"
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          />
        </div>

        {/* PRICE */}
        <div>
          <label className="text-sm text-gray-600">
            Price
          </label>

          <input
            type="text"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Contoh: 500000"
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          />
        </div>

        {/* STOCK */}
        <div>
          <label className="text-sm text-gray-600">
            Stock
          </label>

          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Enter stock"
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          />
        </div>

        {/* BUTTON */}
        <div className="flex justify-end gap-2 pt-4">

          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/product")}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-semibold"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>

        </div>

      </form>
    </div>
  );
}