import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhoneAlt,
  FaCrown,
  FaUserCircle,
} from "react-icons/fa";

// IMPORT DATA JSON
import customers from "../data/customers";

export default function CustomerDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  // CARI CUSTOMER BERDASARKAN ID
  const customer = customers.find(
    (c) => c.id === Number(id)
  );

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
      : "bg-orange-100 text-orange-700 border border-orange-200";

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Customer Detail
          </h1>

          <p className="text-gray-400 mt-1">
            Complete customer information
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
                Customer ID : #{customer.id}
              </p>

              <div className="mt-6">

                <span
                  className={`px-5 py-3 rounded-full text-sm font-semibold bg-white ${loyaltyStyle}`}
                >
                  {customer.loyalty} Member
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
                  {customer.phone}
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
                  {customer.loyalty}
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
              </span>{" "}
              and the active phone number is{" "}
              <span className="font-semibold text-gray-800">
                {customer.phone}
              </span>
              .

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}