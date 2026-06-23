import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [dataForm, setDataForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDataForm({
      ...dataForm,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await signIn(dataForm.email, dataForm.password);
      const origin = location.state?.from?.pathname || "/";
      navigate(origin, { replace: true });
    } catch (err) {
      setError(
        err.message ||
        "Email atau password salah"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
        Welcome Back 👋
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading Message */}
      {loading && (
        <div className="mb-4 bg-green-100 text-green-600 px-4 py-3 rounded-lg text-sm animate-pulse">
          Processing login...
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={dataForm.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/forgot" className="text-xs text-green-600 hover:text-green-700 transition">
              Forgot Password?
            </Link>
          </div>

          <input
            type="password"
            name="password"
            value={dataForm.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
            placeholder="********"
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Login"}
        </button>

      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold transition">
          Register
        </Link>
      </p>

    </div>
  );
}