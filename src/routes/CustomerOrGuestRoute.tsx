import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLES } from "@/constants/roles";
const DASHBOARD_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF];

export default function CustomerOrGuestRoute() {
    const { user } = useAuth();

    if (user && DASHBOARD_ROLES.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}

