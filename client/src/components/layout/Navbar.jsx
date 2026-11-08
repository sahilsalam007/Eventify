
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

function Navbar() {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-6 lg:px-20">
      <Link to="/" className="text-2xl font-bold tracking-wide">
        Event<span className="text-purple-500">ify.</span>
      </Link>

      <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
        <Link to="/" className="text-white">
          Home
        </Link>

        <a href="/#events" className="hover:text-purple-400">
          Explore Events
        </a>

        <a href="/#about" className="hover:text-purple-400">
          About
        </a>

        {isAuthenticated && user?.role === "customer" && (
          <Link to="/my-tickets" className="hover:text-purple-400">
            My Tickets
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="hidden text-sm text-gray-300 sm:block">
              Hi, {user?.name}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 hover:border-purple-400 hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm text-gray-300 hover:text-white sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold hover:bg-purple-700"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
