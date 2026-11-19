import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { WishlistProvider } from "../context/WishlistContext";
import RoleProtectedRoute from "../components/auth/RoleProtectedRoute";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import OrganizerLayout from "../layouts/OrganizerLayout";

// Public & Customer Pages
import Home from "../pages/public/Home";
import ExploreEvents from "../pages/public/ExploreEvents";
import CategoryEvents from "../pages/public/CategoryEvents";
import CategoryPresetPage from "../pages/public/CategoryPresetPage";
import EventDetails from "../pages/public/EventDetails";
import PublicMovies from "../pages/public/Movies";
import MovieDetails from "../pages/public/MovieDetails";
import WishlistPage from "../pages/public/WishlistPage";
import MyBookings from "../pages/public/MyBookings";
import MyTickets from "../pages/public/MyTickets";
import CustomerProfile from "../pages/customer/Profile";
import BookingDetails from "../pages/customer/BookingDetails";
import CustomerDashboard from "../pages/customer/Dashboard";
import PortalLanding from "../pages/public/PortalLanding";
import UserLogin from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";
import VerifySecurityQuestions from "../pages/public/VerifySecurityQuestions";
import ResetPassword from "../pages/public/ResetPassword";
import SecurityQuestionsSettings from "../pages/customer/SecurityQuestionsSettings";

// Organizer Pages
import OrganizerDashboard from "../pages/organizer/Dashboard";
import OrganizerMyEvents from "../pages/organizer/MyEvents";
import CreateOrganizerEvent from "../pages/organizer/CreateEvent";
import EditOrganizerEvent from "../pages/organizer/EditEvent";
import OrganizerBookings from "../pages/organizer/Bookings";
import OrganizerTicketManagement from "../pages/organizer/TicketManagement";
import OrganizerProfile from "../pages/organizer/Profile";

// Admin Pages
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
import PaymentsPage from "../pages/admin/payments/PaymentsPage";
import UsersPage from "../pages/admin/users/UsersPage";
import CategoriesPage from "../pages/admin/categories/CategoriesPage";
import ReportsPage from "../pages/admin/reports/ReportsPage";
import SettingsPage from "../pages/admin/settings/SettingsPage";

export default function AppRoutes() {
  return (
    <WishlistProvider>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route element={<PublicLayout><Outlet /></PublicLayout>}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<ExploreEvents />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/category/:categoryName" element={<CategoryEvents />} />

          {/* Category Aliases */}
          <Route path="/comedy" element={<CategoryPresetPage categoryName="Comedy" />} />
          <Route path="/concerts" element={<CategoryPresetPage categoryName="Concerts" />} />
          <Route path="/theatre" element={<CategoryPresetPage categoryName="Theatre" />} />
          <Route path="/sports" element={<CategoryPresetPage categoryName="Sports" />} />
          <Route path="/workshops" element={<CategoryPresetPage categoryName="Workshops" />} />
          <Route path="/search" element={<ExploreEvents />} />

          {/* Movies */}
          <Route path="/movies" element={<PublicMovies />} />
          <Route path="/movies/:slug" element={<MovieDetails />} />

          {/* Favourites / Wishlist */}
          <Route path="/favorites" element={<WishlistPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Customer Protected Pages */}
          <Route
            path="/my-bookings"
            element={
              <RoleProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <MyBookings />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/my-bookings/:id"
            element={
              <RoleProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <BookingDetails />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <RoleProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <MyTickets />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <CustomerProfile />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/security-questions"
            element={
              <RoleProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <SecurityQuestionsSettings />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["CUSTOMER"]} redirectTo="/login">
                <CustomerDashboard />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* ================= AUTH & PORTAL SELECTION ================= */}
        <Route path="/choose-portal" element={<PortalLanding />} />
        <Route path="/portal" element={<PortalLanding />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-security-questions" element={<VerifySecurityQuestions />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ================= ORGANIZER ROUTES ================= */}
        <Route
          path="/organizer"
          element={
            <RoleProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]} redirectTo="/login">
              <OrganizerLayout>
                <Outlet />
              </OrganizerLayout>
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Navigate replace to="/organizer/dashboard" />} />
          <Route path="dashboard" element={<OrganizerDashboard />} />
          <Route path="events" element={<OrganizerMyEvents />} />
          <Route path="events/create" element={<CreateOrganizerEvent />} />
          <Route path="events/:id/edit" element={<EditOrganizerEvent />} />
          <Route path="bookings" element={<OrganizerBookings />} />
          <Route path="tickets" element={<OrganizerTicketManagement />} />
          <Route path="profile" element={<OrganizerProfile />} />
          <Route path="*" element={<Navigate replace to="/organizer/dashboard" />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]} redirectTo="/admin/login">
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </RoleProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Movies */}
          <Route path="movies" element={<MoviesList />} />
          <Route path="movies/create" element={<MovieForm />} />
          <Route path="movies/new" element={<MovieForm />} />
          <Route path="movies/:id" element={<AdminMovieDetails />} />
          <Route path="movies/:id/edit" element={<MovieForm />} />

          {/* Events */}
          <Route path="events" element={<EventsPage />} />
          <Route path="events/create" element={<EventForm />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/:id/edit" element={<EventForm />} />

          {/* Comedy Shows */}
          <Route path="comedy" element={<ComedyPage />} />

          {/* Dining */}
          <Route path="dining" element={<DiningPage />} />

          {/* Categories */}
          <Route path="categories" element={<CategoriesPage />} />

          {/* Bookings & Payments */}
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="payments" element={<PaymentsPage />} />

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
