import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";
import ExploreEvents from "../pages/public/ExploreEvents";
import CategoryEvents from "../pages/public/CategoryEvents";
import EventDetails from "../pages/public/EventDetails";
import PublicMovies from "../pages/public/Movies";
import MovieDetails from "../pages/public/MovieDetails";
import WishlistPage from "../pages/public/WishlistPage";
import MyBookings from "../pages/public/MyBookings";
import PortalLanding from "../pages/public/PortalLanding";
import UserLogin from "../pages/public/Login";
import Register from "../pages/public/Register";

import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WishlistProvider } from "../context/WishlistContext";

import AdminLayout from "../layouts/AdminLayout";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import MoviesList from "../pages/admin/movies/MoviesList";
import MovieForm from "../pages/admin/movies/MovieForm";
import AdminMovieDetails from "../pages/admin/movies/MovieDetails";
import EventsPage from "../pages/admin/events/EventsPage";
import EventForm from "../pages/admin/events/EventForm";
import ComedyPage from "../pages/admin/comedy/ComedyPage";
import DiningPage from "../pages/admin/dining/DiningPage";
import BookingsPage from "../pages/admin/bookings/BookingsPage";
import UsersPage from "../pages/admin/users/UsersPage";
import CategoriesPage from "../pages/admin/categories/CategoriesPage";
import ReportsPage from "../pages/admin/reports/ReportsPage";
import SettingsPage from "../pages/admin/settings/SettingsPage";

function AdminRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FCF9F4] text-sm font-bold text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-slate-200 border-t-[#E31824]" />
          <span>Loading Admin Workspace…</span>
        </div>
      </div>
    );
  }
  if (!user || user.role !== "ADMIN") {
    return <Navigate replace to="/admin/login" />;
  }
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default function AppRoutes() {
  return (
    <WishlistProvider>
      <Routes>
        {/* Public Discovery & Booking Pages */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/events"
          element={
            <PublicLayout>
              <ExploreEvents />
            </PublicLayout>
          }
        />
        <Route
          path="/category/:categoryName"
          element={
            <PublicLayout>
              <CategoryEvents />
            </PublicLayout>
          }
        />
        <Route
          path="/events/:id"
          element={
            <PublicLayout>
              <EventDetails />
            </PublicLayout>
          }
        />
        <Route
          path="/movies"
          element={
            <PublicLayout>
              <PublicMovies />
            </PublicLayout>
          }
        />
        <Route
          path="/movies/:slug"
          element={
            <PublicLayout>
              <MovieDetails />
            </PublicLayout>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PublicLayout>
              <WishlistPage />
            </PublicLayout>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PublicLayout>
              <MyBookings />
            </PublicLayout>
          }
        />

        {/* Portal Selection / Gateway */}
        <Route path="/choose-portal" element={<PortalLanding />} />
        <Route path="/portal" element={<PortalLanding />} />

        {/* User Login & Register */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Auth Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Portal */}
        <Route path="/admin" element={<AdminRoutes />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Movies */}
          <Route path="movies" element={<MoviesList />} />
          <Route path="movies/new" element={<MovieForm />} />
          <Route path="movies/:id" element={<AdminMovieDetails />} />
          <Route path="movies/:id/edit" element={<MovieForm />} />

          {/* Events */}
          <Route path="events" element={<EventsPage />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/:id/edit" element={<EventForm />} />

          {/* Comedy Shows */}
          <Route path="comedy" element={<ComedyPage />} />

          {/* Dining */}
          <Route path="dining" element={<DiningPage />} />

          {/* Categories */}
          <Route path="categories" element={<CategoriesPage />} />

          {/* Bookings */}
          <Route path="bookings" element={<BookingsPage />} />

          {/* Users */}
          <Route path="users" element={<UsersPage />} />

          {/* Reports & Analytics */}
          <Route path="reports" element={<ReportsPage />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Catch-all admin fallback */}
          <Route path="*" element={<Navigate replace to="/admin/dashboard" />} />
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </WishlistProvider>
  );
}
