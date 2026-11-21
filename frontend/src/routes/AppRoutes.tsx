import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { WishlistProvider } from "../context/WishlistContext";
import PublicRoute from "./PublicRoute";
import RoleBasedRoute from "./RoleBasedRoute";

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
import SeatSelection from "../pages/public/SeatSelection";
import Checkout from "../pages/public/Checkout";
import BookingConfirmation from "../pages/public/BookingConfirmation";
import Dining from "../pages/public/Dining";
import Sports from "../pages/public/Sports";
import PublicMovies from "../pages/public/Movies";
import MovieDetails from "../pages/public/MovieDetails";
import WishlistPage from "../pages/public/WishlistPage";
import MyBookings from "../pages/public/MyBookings";
import MyTickets from "../pages/public/MyTickets";
import CustomerProfile from "../pages/customer/Profile";
import BookingDetails from "../pages/customer/BookingDetails";
import CustomerDashboard from "../pages/customer/Dashboard";
import Rewards from "../pages/customer/Rewards";
import PortalLanding from "../pages/public/PortalLanding";
import UserLogin from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";
import VerifySecurityQuestions from "../pages/public/VerifySecurityQuestions";
import ResetPassword from "../pages/public/ResetPassword";
import SecurityQuestionsSettings from "../pages/customer/SecurityQuestionsSettings";
import NotFound from "../pages/public/NotFound";

// Organizer Pages
import OrganizerDashboard from "../pages/organizer/Dashboard";
import OrganizerLogin from "../pages/organizer/OrganizerLogin";
import OrganizerRegister from "../pages/organizer/OrganizerRegister";
import OrganizerMyEvents from "../pages/organizer/MyEvents";
import CreateOrganizerEvent from "../pages/organizer/CreateEvent";
import EditOrganizerEvent from "../pages/organizer/EditEvent";
import OrganizerBookings from "../pages/organizer/Bookings";
import OrganizerTicketManagement from "../pages/organizer/TicketManagement";
import OrganizerProfile from "../pages/organizer/Profile";
import OrganizerCalendar from "../pages/organizer/Calendar";
import OrganizerReports from "../pages/organizer/Reports";
import OrganizerMessages from "../pages/organizer/Messages";
import OrganizerTeam from "../pages/organizer/Team";
import OrganizerSettings from "../pages/organizer/Settings";

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
        {/* ================= PUBLIC & CUSTOMER ROUTES ================= */}
        <Route element={<PublicLayout><Outlet /></PublicLayout>}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<ExploreEvents />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/seats" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/booking-confirmed/:bookingId" element={<BookingConfirmation />} />
          <Route path="/category/:categoryName" element={<CategoryEvents />} />

          {/* New Entertainment Verticals */}
          <Route path="/dining" element={<Dining />} />
          <Route path="/sports" element={<Sports />} />

          {/* Category Aliases */}
          <Route path="/comedy" element={<CategoryPresetPage categoryName="Comedy" />} />
          <Route path="/concerts" element={<CategoryPresetPage categoryName="Concerts" />} />
          <Route path="/theatre" element={<CategoryPresetPage categoryName="Theatre" />} />
          <Route path="/workshops" element={<CategoryPresetPage categoryName="Workshops" />} />
          <Route path="/search" element={<ExploreEvents />} />

          {/* Movies */}
          <Route path="/movies" element={<PublicMovies />} />
          <Route path="/movies/:slug" element={<MovieDetails />} />

          {/* Favourites / Wishlist */}
          <Route path="/favorites" element={<WishlistPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Customer Hub & Rewards */}
          <Route path="/rewards" element={<Rewards />} />

          {/* Customer Protected Pages */}
          <Route
            path="/my-bookings"
            element={
              <RoleBasedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <MyBookings />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/my-bookings/:id"
            element={
              <RoleBasedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <BookingDetails />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <RoleBasedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <MyTickets />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleBasedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <CustomerProfile />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/security-questions"
            element={
              <RoleBasedRoute allowedRoles={["CUSTOMER", "ORGANIZER", "ADMIN"]} redirectTo="/login">
                <SecurityQuestionsSettings />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RoleBasedRoute allowedRoles={["CUSTOMER"]} redirectTo="/login">
                <CustomerDashboard />
              </RoleBasedRoute>
            }
          />

          {/* 404 Route within Public Layout */}
          <Route path="/404" element={<NotFound />} />
        </Route>

        {/* ================= GUEST AUTH ROUTES ================= */}
        <Route
          path="/choose-portal"
          element={
            <PublicRoute>
              <PortalLanding />
            </PublicRoute>
          }
        />
        <Route
          path="/portal"
          element={
            <PublicRoute>
              <PortalLanding />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute restrictedToGuest>
              <UserLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute restrictedToGuest>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute restrictedToGuest>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-security-questions"
          element={
            <PublicRoute restrictedToGuest>
              <VerifySecurityQuestions />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute restrictedToGuest>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/admin/login"
          element={
            <PublicRoute restrictedToGuest>
              <AdminLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/organizer/login"
          element={
            <PublicRoute restrictedToGuest>
              <OrganizerLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/organizer/register"
          element={
            <PublicRoute restrictedToGuest>
              <OrganizerRegister />
            </PublicRoute>
          }
        />

        {/* ================= ORGANIZER ROUTES ================= */}
        <Route
          path="/organizer"
          element={
            <RoleBasedRoute allowedRoles={["ORGANIZER", "ADMIN"]} redirectTo="/login">
              <OrganizerLayout>
                <Outlet />
              </OrganizerLayout>
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate replace to="/organizer/dashboard" />} />
          <Route path="dashboard" element={<OrganizerDashboard />} />
          <Route path="events" element={<OrganizerMyEvents />} />
          <Route path="events/create" element={<CreateOrganizerEvent />} />
          <Route path="events/:id/edit" element={<EditOrganizerEvent />} />
          <Route path="bookings" element={<OrganizerBookings />} />
          <Route path="calendar" element={<OrganizerCalendar />} />
          <Route path="reports" element={<OrganizerReports />} />
          <Route path="messages" element={<OrganizerMessages />} />
          <Route path="team" element={<OrganizerTeam />} />
          <Route path="settings" element={<OrganizerSettings />} />
          <Route path="tickets" element={<OrganizerTicketManagement />} />
          <Route path="profile" element={<OrganizerProfile />} />
          <Route path="*" element={<Navigate replace to="/organizer/dashboard" />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute allowedRoles={["ADMIN"]} redirectTo="/admin/login">
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </RoleBasedRoute>
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

        {/* ================= GLOBAL 404 CATCH-ALL ================= */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFound />
            </PublicLayout>
          }
        />
      </Routes>
    </WishlistProvider>
  );
}
