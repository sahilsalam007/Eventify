
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../authSlice";
import api from "../../../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        })
      );

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-[#101A35] border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Join Eventify and discover amazing events
        </p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-[#0B1020] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#0B1020] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-[#0B1020] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full bg-[#0B1020] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Sign In
          </Link>
        </p>

        <Link
          to="/"
          className="block text-center text-gray-500 hover:text-white text-sm mt-5"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Register;
