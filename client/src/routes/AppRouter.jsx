import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;