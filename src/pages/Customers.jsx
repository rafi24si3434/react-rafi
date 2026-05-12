import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSearch,
  FaUserPlus,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTrashAlt,
} from "react-icons/fa";

// IMPORT DATA JSON
import customers from "../data/customers";

const ITEMS_PER_PAGE = 5;

// ✅ Loyalty Badge
function LoyaltyBadge({ loyalty }) {

  const styles =
    loyalty === "Gold"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : loyalty === "Silver"
      ? "bg-slate-100 text-slate-600 border border-slate-200"
      : "bg-orange-100 text-orange-600 border border-orange-200";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}
    >
      {loyalty}
    </span>
  );
}

// ✅ Table Row
function TableRow({
  id,
  name,
  email,
  phone,
  loyalty,
  image,
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-green-50/40 transition duration-200">

      {/* ID */}
      <td className="px-6 py-5 text-gray-500 font-medium">
        #{id}
      </td>

      {/* CUSTOMER */}
      <td className="px-6 py-5">

        <div className="flex items-center gap-4">

          {/* FOTO */}
          <img
            src={image}
            alt={name}
            className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-sm"
          />

          {/* INFO */}
          <div>

            <Link
              to={`/customers/${id}`}
              className="font-semibold text-gray-800 hover:text-green-600 transition"
            >
              {name}
            </Link>

            <p className="text-xs text-gray-400">
              Customer Member
            </p>

          </div>

        </div>

      </td>

      {/* EMAIL */}
      <td className="px-6 py-5 text-gray-500">
        {email}
      </td>

      {/* PHONE */}
      <td className="px-6 py-5 text-gray-500">
        {phone}
      </td>

      {/* LOYALTY */}
      <td className="px-6 py-5">
        <LoyaltyBadge loyalty={loyalty} />
      </td>

      {/* ACTION */}
      <td className="px-6 py-5">

        <div className="flex items-center gap-4">

          <Link
            to={`/customers/${id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-medium transition"
          >
            <FaEye />
            View
          </Link>

          <button className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium transition">
            <FaTrashAlt />
            Delete
          </button>

        </div>

      </td>

    </tr>
  );
}

export default function Customers() {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ FILTER DATA
  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ PAGINATION
  const totalPages = Math.ceil(
    filtered.length / ITEMS_PER_PAGE
  );

  const start = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentData = filtered.slice(
    start,
    start + ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 bg-[#F8F9FB] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Customers
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Manage your customers data easily
          </p>

        </div>

        <button
          onClick={() => navigate("/customers/add")}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl shadow-md transition"
        >
          <FaUserPlus />
          Add Customer
        </button>

      </div>

      {/* SEARCH */}
      <div className="relative mb-6 w-96">

        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-white pl-11 pr-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
        />

        <FaSearch className="absolute left-4 top-4 text-gray-400 text-sm" />

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-gradient-to-r from-green-50 to-white text-gray-600 text-sm">

            <tr>

              <th className="px-6 py-5 font-semibold">
                ID
              </th>

              <th className="px-6 py-5 font-semibold">
                Customer
              </th>

              <th className="px-6 py-5 font-semibold">
                Email
              </th>

              <th className="px-6 py-5 font-semibold">
                Phone
              </th>

              <th className="px-6 py-5 font-semibold">
                Loyalty
              </th>

              <th className="px-6 py-5 font-semibold">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {currentData.map((c) => (
              <TableRow key={c.id} {...c} />
            ))}

            {currentData.length === 0 && (
              <tr>

                <td
                  colSpan="6"
                  className="text-center py-12 text-gray-400"
                >
                  No customers found
                </td>

              </tr>
            )}

          </tbody>

        </table>

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