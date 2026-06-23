import "./assets/tailwind.css";
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

/* PAGES */
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Customers = lazy(() => import("./pages/Customers"));
const Orders = lazy(() => import("./pages/Orders"));
const Product = lazy(() => import("./pages/Product"));
const Notes = lazy(() => import("./pages/Notes"));
const FiturXyz = lazy(() => import("./pages/FiturXyz"));

/* DETAIL PAGES */
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));

/* ADD PAGES */
const AddCustomer = lazy(() => import("./pages/AddCustomer"));
const AddOrder = lazy(() => import("./pages/AddOrder"));
const AddProduct = lazy(() => import("./pages/AddProduct"));

/* ERROR PAGE */
const ErrorPage = lazy(() => import("./pages/ErrorPage"));

/* AUTH */
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Forgot = lazy(() => import("./pages/auth/Forgot"));

/* LAYOUT */
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>

        {/* ================= AUTH ================= */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<Forgot />} />
          </Route>
        </Route>

        {/* ================= MAIN ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Customers (Admin only) */}
            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/add" element={<AddCustomer />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/notes" element={<Notes />} />
            </Route>

            {/* Orders (Both) */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/add" element={<AddOrder />} />
            <Route path="/orders/:id" element={<OrderDetail />} />

            {/* Product (Both read, Admin can add/edit/delete) */}
            <Route path="/product" element={<Product />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/product/add" element={<AddProduct />} />
            </Route>

            {/* Fitur XYZ */}
            <Route path="/fitur-xyz" element={<FiturXyz />} />

            {/* Error Pages */}
            <Route path="/400" element={<ErrorPage code="400" />} />
            <Route path="/401" element={<ErrorPage code="401" />} />
            <Route path="/403" element={<ErrorPage code="403" />} />
            <Route path="*" element={<ErrorPage code="404" />} />

          </Route>
        </Route>

      </Routes>
    </Suspense>
  );
}

export default App;