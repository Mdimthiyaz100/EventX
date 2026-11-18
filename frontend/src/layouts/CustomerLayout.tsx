import { Outlet } from "react-router-dom";
import PublicLayout from "./PublicLayout";

export default function CustomerLayout() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}
