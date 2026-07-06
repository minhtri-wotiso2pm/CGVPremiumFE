import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { buildLoginRedirectState } from "@/features/auth/utils/authRedirect";

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={buildLoginRedirectState(location)}
                replace
            />
        );
    }

    return <Outlet />;
}