import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export default function AddCustomer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    loyalty: "Bronze",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // VALIDASI SEDERHANA
    if (!form.name || !form.email || !form.phone) {
      setError("Semua field wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      // 1. Initialize a separate client with persistSession: false to avoid signing out the current Admin
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      // 2. Sign up the customer user
      const randomId = Math.floor(Math.random() * 10);
      const { data, error: signUpError } = await tempSupabase.auth.signUp({
        email: form.email,
        password: "CustomerPassword123!", // default placeholder password
        options: {
          data: {
            name: form.name,
            role: "Member",
            phone: form.phone,
            avatar_url: `https://randomuser.me/api/portraits/men/${randomId}.jpg`,
          },
        },
      });

      if (signUpError) throw signUpError;

      // 3. Since the trigger created the profile, update the tier value to match selection
      if (data?.user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ tier: form.loyalty })
          .eq("id", data.user.id);

        if (updateError) throw updateError;
      }

      // redirect kembali ke halaman customers
      navigate("/customers");
    } catch (err) {
      setError(err.message || "Gagal menambahkan customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
      
      <h1 className="text-2xl font-semibold mb-4">
        Add Customer
      </h1>

      {error && (
        <div className="mb-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* NAME */}
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter name"
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm text-gray-600">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone"
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          />
        </div>

        {/* LOYALTY */}
        <div>
          <label className="text-sm text-gray-600">Loyalty Tier</label>
          <select
            name="loyalty"
            value={form.loyalty}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
          >
            <option>Bronze</option>
            <option>Silver</option>
            <option>Gold</option>
            <option>Platinum</option>
          </select>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/customers")}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-semibold"
          >
            {loading ? "Adding..." : "Save Customer"}
          </button>
        </div>

      </form>
    </div>
  );
}