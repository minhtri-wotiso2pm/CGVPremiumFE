import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLES } from "@/constants/roles";

function getDashboardByRole(role?: string) {
    switch (role?.toUpperCase()) {
        case ROLES.ADMIN:
            return "/admin/dashboard";

        case ROLES.MANAGER:
            return "/manager/dashboard";

        case ROLES.STAFF:
            return "/staff/dashboard";

        case ROLES.CUSTOMER:
            return "/customer";

        default:
            return "/";
    }
}

export default function PublicRoute() {
    const { user } = useAuth();

    if (user) {
        return (
            <Navigate
                to={getDashboardByRole(user.role)}
                replace
            />
        );
    }

    return <Outlet />;
}