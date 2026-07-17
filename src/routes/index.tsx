import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PermissionRoute from "./PermissionRoute";
import PublicRoute from "./PublicRoute";
import CustomerOrGuestRoute from "./CustomerOrGuestRoute";

import PublicLayout from "@/layouts/PublicLayout/PublicLayout";
import WelcomeLayout from "@/layouts/WelcomeLayout/WelcomeLayout";
import CustomerLayout from "@/layouts/CustomerLayout/CustomerLayout";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import ManagerLayout from "@/layouts/ManagerLayout/ManagerLayout";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import RegisterSuccessPage from "@/features/auth/pages/RegisterSuccessfulPage";
import ResisterEmailPage from "@/features/auth/pages/RegisterEmailPage";
import RegisterEmailSendPage from "@/features/auth/pages/RegisterEmailSendPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import ForgotPasswordSuccessPage from "@/features/auth/pages/ForgotPasswordSuccessfulPage";
import ResetPasswordSuccessPage from "@/features/auth/pages/ResetPasswordPageSuccessfulPage";

import CustomerDashboard from "@/features/customer/pages/CustomerDashboard";
import MovieDetailPage from "@/features/movies/pages/MovieDetailPage";
import CustomerProfilePage from "@/features/customer/pages/ProfilePage";
import TicketDetailPage from "@/features/customer/pages/TicketDetailPage";
import {
    CustomerProfileLayout,
    TicketsPage,
    MembershipPage,
    VouchersPage,
    WalletPage,
    NotificationsPage,
    SettingsPage,
} from "@/features/customer/pages/CustomerProfileRoutes";

import StaffDashboard from "@/features/staff/pages/StaffDashboard";
import CheckInPage from "@/features/staff/pages/CheckInPage";
import CounterBookingPage from "@/features/staff/pages/CounterBookingPage";
import FnbPickupPage from "@/features/staff/pages/FnbPickupPage";
import ManagerDashboard from "@/features/manager/pages/ManagerDashboard";
import CinemaManagementPage from "@/features/manager/pages/CinemaManagementPage";
import MovieManagementPage from "@/features/manager/pages/MovieManagementPage";
import FnbManagementPage from "@/features/manager/pages/FnbManagementPage";
import RoomManagementPage from "@/features/manager/pages/RoomManagementPage";
import SeatManagementPage from "@/features/manager/pages/SeatManagementPage";
import ShowtimeManagementPage from "@/features/manager/pages/ShowtimeManagementPage";
import ShowtimeTypeManagementPage from "@/features/manager/pages/ShowtimeTypeManagementPage";
import ShowtimeCalendarPage from "@/features/manager/pages/ShowtimeCalendarPage";
import ReportsPage from "@/features/reports/pages/ReportsPage";
import VoucherManagementPage from "@/features/vouchers/pages/VoucherManagementPage";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import UserManagementPage from "@/features/admin/pages/UserManagementPage";
import SeatTypeManagementPage from "@/features/admin/pages/SeatTypeManagementPage";
import RoomTypeManagementPage from "@/features/admin/pages/RoomTypeManagementPage";
import LoyaltyTierManagementPage from "@/features/admin/pages/LoyaltyTierManagementPage";
import AdminProfilePage from "@/features/admin/pages/AdminProfilePage";
import ActivityLogPage from "@/features/admin/pages/ActivityLogPage";
import EmailLogPage from "@/features/admin/pages/EmailLogPage";
import DashboardNotificationsPage from "@/features/notifications/pages/DashboardNotificationsPage";

import WelcomePage from "@/features/public/pages/WelcomePage";
import ShowtimePage from "@/features/booking/pages/ShowtimePage";
import SeatSelectionPage from "@/features/booking/pages/SeatSelectionPage";
import FnbPage from "@/features/booking/pages/FnbPage";
import PaymentPage from "@/features/booking/pages/PaymentPage";
import BookingConfirmationPage from "@/features/booking/pages/BookingConfirmationPage";
import PaymentCancelledPage from "@/features/booking/pages/PaymentCancelledPage";
import TheatersPage from "@/features/public/pages/TheatersPage";
import PromotionsPage from "@/features/public/pages/PromotionsPage";
import AboutUsPage from "@/features/public/pages/AboutUsPage";
import ForbiddenPage from "@/features/common/pages/ForbiddenPage";
import NotFoundPage from "@/features/common/pages/NotFoundPage";

import { ROLES } from "@/constants/roles";

export const router = createBrowserRouter([
    // =====================
    // WELCOME (guest + customer only — Admin/Manager/Staff → /403)
    // =====================
    {
        element: <CustomerOrGuestRoute />,
        children: [
            {
                path: "/",
                element: <WelcomeLayout />,
                children: [
                    {
                        index: true,
                        element: <WelcomePage />,
                    },
                    {
                        path: "movies/:movieId",
                        element: <MovieDetailPage />,
                    },
                    {
                        path: "theaters",
                        element: <TheatersPage />,
                    },
                    {
                        path: "promotions",
                        element: <PromotionsPage />,
                    },
                    {
                        path: "about",
                        element: <AboutUsPage />,
                    },
                ],
            },
        ],
    },

    // =====================
    // PUBLIC (auth pages — redirect if logged in)
    // =====================
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/",
                // element: <PublicLayout />,
                element: <PublicLayout />,
                children: [
                    {
                        path: "login",
                        element: <LoginPage />,
                    },
                    {
                        path: "register",
                        element: <RegisterPage />,
                    },
                    {
                        path: "/forgotPassword",
                        element: <ForgotPasswordPage />,
                    },
                    {
                        path: "/forgotPasswordSuccess",
                        element: <ForgotPasswordSuccessPage />,
                    },
                    {
                        path: "/resetPassword",
                        element: <ResetPasswordPage />,
                    },
                    {
                        path: "/resetPasswordSuccess",
                        element: <ResetPasswordSuccessPage />,
                    },
                    {
                        path: "/registerEmail",
                        element: <ResisterEmailPage />,
                    },
                    {
                        path: "/registerEmailSend",
                        element: <RegisterEmailSendPage />,
                    },
                    {
                        path: "/registerSuccess",
                        element: <RegisterSuccessPage />,
                    },

                ],
            },
        ],
    },

    // =====================
    // 403
    // =====================
    {
        path: "/403",
        element: <ForbiddenPage />,
    },

    // =====================
    // PROTECTED
    // =====================
    {
        element: <ProtectedRoute />,
        children: [
            // CUSTOMER
            {
                element: (
                    <PermissionRoute
                        allowedRoles={[ROLES.CUSTOMER]}
                    />
                ),
                children: [
                    {
                        path: "/customer",
                        element: <CustomerLayout />,
                        children: [
                            {
                                index: true,
                                element: <CustomerDashboard />,
                            },
                            {
                                path: "dashboard",
                                element: <CustomerDashboard />,
                            },
                            {
                                path: "movies/:movieId",
                                element: <MovieDetailPage />,
                            },
                            {
                                path: "movie/:movieId/showtimes",
                                element: <ShowtimePage />,
                            },
                            {
                                path: "seats/:showtimeId",
                                element: <SeatSelectionPage />,
                            },
                            {
                                path: "booking/fnb",
                                element: <FnbPage />,
                            },
                            {
                                path: "booking/payment",
                                element: <PaymentPage />,
                            },
                            {
                                path: "booking/confirmation",
                                element: <BookingConfirmationPage />,
                            },
                            {
                                // PayOS's configured cancelUrl — lands here (no trailing
                                // segment) when the customer cancels/backs out of checkout.
                                path: "booking",
                                element: <PaymentCancelledPage />,
                            },
                            {
                                path: "theaters",
                                element: <TheatersPage />,
                            },
                            {
                                path: "promotions",
                                element: <PromotionsPage />,
                            },
                            {
                                path: "about",
                                element: <AboutUsPage />,
                            },
                            {
                                // Sibling of "profile" (not nested inside CustomerProfileLayout) so
                                // the ticket detail view renders full-screen, without the profile
                                // sidebar — a focused "your ticket" screen rather than a settings page.
                                path: "profile/tickets/:bookingId",
                                element: <TicketDetailPage />,
                            },
                            {
                                path: "profile",
                                element: <CustomerProfileLayout />,
                                children: [
                                    {
                                        index: true,
                                        element: <CustomerProfilePage />,
                                    },
                                    {
                                        path: "tickets",
                                        element: <TicketsPage />,
                                    },
                                    {
                                        path: "membership",
                                        element: <MembershipPage />,
                                    },
                                    {
                                        path: "vouchers",
                                        element: <VouchersPage />,
                                    },
                                    {
                                        path: "wallet",
                                        element: <WalletPage />,
                                    },
                                    {
                                        path: "notifications",
                                        element: <NotificationsPage />,
                                    },
                                    {
                                        path: "settings",
                                        element: <SettingsPage />,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },

            // STAFF
            {
                element: (
                    <PermissionRoute
                        allowedRoles={[ROLES.STAFF]}
                    />
                ),
                children: [
                    {
                        path: "/staff",
                        element: <StaffLayout />,
                        children: [
                            {
                                path: "dashboard",
                                element: <StaffDashboard />,
                            },
                            {
                                path: "counter",
                                element: <CounterBookingPage />,
                            },
                            {
                                path: "checkin",
                                element: <CheckInPage />,
                            },
                            {
                                path: "fnb-pickup",
                                element: <FnbPickupPage />,
                            },
                            {
                                path: "notifications",
                                element: <DashboardNotificationsPage />,
                            },
                            {
                                path: "profile",
                                element: <AdminProfilePage />,
                            },
                        ],
                    },
                ],
            },

            // MANAGER
            {
                element: (
                    <PermissionRoute
                        allowedRoles={[ROLES.MANAGER]}
                    />
                ),
                children: [
                    {
                        path: "/manager",
                        element: <ManagerLayout />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="/manager/dashboard" replace />,
                            },
                            {
                                path: "dashboard",
                                element: <ManagerDashboard />,
                            },
                            {
                                path: "rooms",
                                element: <RoomManagementPage />,
                            },
                            {
                                path: "rooms/:roomId/seats",
                                element: <SeatManagementPage />,
                            },
                            {
                                path: "showtimes",
                                element: <ShowtimeManagementPage />,
                            },
                            {
                                path: "showtime-types",
                                element: <ShowtimeTypeManagementPage />,
                            },
                            {
                                path: "showtime-calendar",
                                element: <ShowtimeCalendarPage />,
                            },
                            {
                                path: "reports",
                                element: <ReportsPage scope="manager" />,
                            },
                            {
                                path: "notifications",
                                element: <DashboardNotificationsPage />,
                            },
                            {
                                path: "profile",
                                element: <AdminProfilePage />,
                            },
                        ],
                    },
                ],
            },

            // ADMIN
            {
                element: (
                    <PermissionRoute
                        allowedRoles={[ROLES.ADMIN]}
                    />
                ),
                children: [
                    {
                        path: "/admin",
                        element: <AdminLayout />,
                        children: [
                            {
                                index: true,
                                element: <AdminDashboard />,
                            },
                            {
                                path: "dashboard",
                                element: <AdminDashboard />,
                            },
                            {
                                path: "users",
                                element: <UserManagementPage />,
                            },
                            {
                                path: "cinemas",
                                element: <CinemaManagementPage />,
                            },
                            {
                                path: "movies",
                                element: <MovieManagementPage />,
                            },
                            {
                                path: "products",
                                element: <FnbManagementPage />,
                            },
                            {
                                path: "room-types",
                                element: <RoomTypeManagementPage />,
                            },
                            {
                                path: "seat-types",
                                element: <SeatTypeManagementPage />,
                            },
                            {
                                path: "promotions",
                                element: <VoucherManagementPage />,
                            },
                            {
                                path: "loyalty-tiers",
                                element: <LoyaltyTierManagementPage />,
                            },
                            {
                                path: "reports",
                                element: <ReportsPage scope="admin" />,
                            },
                            {
                                path: "activity-logs",
                                element: <ActivityLogPage />,
                            },
                            {
                                path: "email-logs",
                                element: <EmailLogPage />,
                            },
                            {
                                path: "notifications",
                                element: <DashboardNotificationsPage />,
                            },
                            {
                                path: "profile",
                                element: <AdminProfilePage />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    // =====================
    // 404
    // =====================
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);