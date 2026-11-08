
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import EventDetails from "../features/events/pages/EventDetails";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import MyTickets from "../features/auth/pages/MyTickets";
import MyBookings from "../features/auth/pages/MyBookings";
import BookingDetails from "../features/auth/pages/BookingDetails";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/bookings/:bookingId"
            element={<BookingDetails />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
