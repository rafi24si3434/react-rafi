import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaUserCircle,
  FaShoppingBag,
} from "react-icons/fa";

// IMPORT DATA JSON
import orders from "../data/orders";

export default function OrderDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  // CARI ORDER BERDASARKAN ID
  const order = orders.find(
    (o) => o.id === Number(id)
  );

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
    <div className="min-h-screen bg-[#F8F9FB] p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

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
                  className="w-72 h-72 object-cover rounded-2xl"
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
                Rp {order.total.toLocaleString()}
              </h2>

              <div className="mt-6">

                <span
                  className={`px-5 py-3 rounded-full text-sm font-semibold bg-white ${statusStyle}`}
                >
                  {order.status}
                </span>

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
                  Customer Name
                </p>

                <h2 className="text-lg font-bold text-gray-800">
                  {order.customer}
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
                  Rp {order.total.toLocaleString()}
                </h2>

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
                {order.date}
              </h2>

            </div>

          </div>

        </div>

        {/* DESCRIPTION */}
        <div className="p-8">

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-8">

            <div className="flex items-center gap-3 mb-4">

              <FaShoppingBag className="text-2xl text-green-600" />

              <h1 className="text-2xl font-bold text-green-700">
                Order Information
              </h1>

            </div>

            <p className="text-gray-600 leading-relaxed text-lg">

              Order transaction from{" "}
              <span className="font-semibold text-gray-800">
                {order.customer}
              </span>{" "}
              has a total payment of{" "}
              <span className="font-semibold text-gray-800">
                Rp {order.total.toLocaleString()}
              </span>
              . The order status is currently{" "}
              <span className="font-semibold text-gray-800">
                {order.status}
              </span>{" "}
              and the transaction was created on{" "}
              <span className="font-semibold text-gray-800">
                {order.date}
              </span>
              .

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}