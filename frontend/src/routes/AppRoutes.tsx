import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
        path="/"
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}