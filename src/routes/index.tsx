import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PermissionRoute from "./PermissionRoute";
import PublicRoute from "./PublicRoute";

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
import {
    CustomerProfileLayout,
    TicketsPage,
    MembershipPage,
    WalletPage,
    SettingsPage,
} from "@/features/customer/pages/CustomerProfileRoutes";

import StaffDashboard from "@/features/staff/pages/StaffDashboard";
import ManagerDashboard from "@/features/manager/pages/ManagerDashboard";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";

import WelcomePage from "@/features/public/pages/WelcomePage";
import ForbiddenPage from "@/features/common/pages/ForbiddenPage";
import NotFoundPage from "@/features/common/pages/NotFoundPage";

import { ROLES } from "@/constants/roles";

export const router = createBrowserRouter([
    // =====================
    // WELCOME (open — no auth guard)
    // =====================
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
                    {
                        path: "/dashboard",
                        element: <CustomerDashboard />,
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
                                        path: "wallet",
                                        element: <WalletPage />,
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
                                path: "dashboard",
                                element: <ManagerDashboard />,
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
                                path: "dashboard",
                                element: <AdminDashboard />,
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