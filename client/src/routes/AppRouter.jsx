import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import EventDetails from "../features/events/pages/EventDetails";
import EditEvent from "../features/organizer/pages/EditEvent";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import MyTickets from "../features/auth/pages/MyTickets";
import MyBookings from "../features/auth/pages/MyBookings";
import BookingDetails from "../features/auth/pages/BookingDetails";
import CreateEvent from "../features/organizer/pages/CreateEvent";
import OrganizerDashboard from "../features/organizer/pages/OrganizerDashboard";
import MyEvents from "../features/organizer/pages/MyEvents";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer-only Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/bookings/:bookingId" element={<BookingDetails />} />
        </Route>

        {/* Organizer-only Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/events/create" element={<CreateEvent />} />
          <Route path="/organizer/events" element={<MyEvents />} />
          <Route
            path="/organizer/events/:eventId/edit"
            element={<EditEvent />}
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
