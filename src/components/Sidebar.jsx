import { NavLink } from "react-router-dom";
import {
  FaThLarge,
  FaList,
  FaHeadphones,
  FaBoxOpen,
  FaStar,
} from "react-icons/fa";

export default function Sidebar() {

  // function untuk styling active
  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer
     ${
       isActive
         ? "bg-white shadow-sm font-medium text-gray-800"
         : "text-gray-500 hover:bg-white hover:shadow-sm"
     }`;

  const iconClass = (isActive) =>
    `text-lg ${isActive ? "text-gray-700" : "text-gray-400"}`;

  return (
    <div className="w-64 h-screen bg-[#F8F9FB] flex flex-col justify-between px-6 py-6">

      {/* Logo */}
      <div>

        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-800">
            Sedap<span className="text-green-500">.</span>
          </h1>

          <p className="text-sm text-gray-400">
            Modern Admin Dashboard
          </p>
        </div>

        {/* Menu */}
        <ul className="space-y-3">

          <li>
            <NavLink to="/" end className={menuClass}>
              {({ isActive }) => (
                <>
                  <FaThLarge className={iconClass(isActive)} />
                  Dashboard
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink to="/orders" className={menuClass}>
              {({ isActive }) => (
                <>
                  <FaList className={iconClass(isActive)} />
                  Orders
                </>
              )}
            </NavLink>
          </li>

          {/* PRODUCT MENU */}
          <li>
            <NavLink to="/product" className={menuClass}>
              {({ isActive }) => (
                <>
                  <FaBoxOpen className={iconClass(isActive)} />
                  Product
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink to="/customers" className={menuClass}>
              {({ isActive }) => (
                <>
                  <FaHeadphones className={iconClass(isActive)} />
                  Customers
                </>
              )}
            </NavLink>
          </li>

          {/* FITUR XYZ */}
          <li>
            <NavLink to="/fitur-xyz" className={menuClass}>
              {({ isActive }) => (
                <>
                  <FaStar className={iconClass(isActive)} />
                  Fitur XYZ
                </>
              )}
            </NavLink>
          </li>

        </ul>
      </div>

      {/* Footer */}
      <div>

        <div className="bg-green-500 rounded-2xl p-4 text-white flex justify-between items-center">

          <div>
            <p className="text-sm leading-tight">
              Please organize your menus through button below!
            </p>

            <button className="mt-3 bg-white text-green-600 text-sm px-3 py-1 rounded-lg">
              + Add Menus
            </button>
          </div>

          <img
            src="/img/cs2.png"
            alt="customer support"
            className="w-16 h-16 rounded-full object-cover"
          />

        </div>

        <p className="text-xs text-gray-400 mt-6">
          Sedap Restaurant Admin Dashboard
        </p>

        <p className="text-xs text-gray-300">
          © 2025 All Right Reserved
        </p>

      </div>
    </div>
  );
}