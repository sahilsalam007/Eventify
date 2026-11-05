import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import EventDetails from "../features/events/pages/EventDetails";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;