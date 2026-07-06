import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getDashboardByRole } from "@/features/auth/utils/getDashboardByRole";
import { getSafeRedirect, type LoginRedirectState } from "@/features/auth/utils/authRedirect";

/** Guards /login, /register, etc. — bounces already-authenticated users
 *  away. Must resolve to the SAME target LoginPage's own post-login
 *  navigate() would pick; otherwise, once loginSuccess() flips `user`
 *  truthy, this component's redirect races LoginPage's explicit navigate()
 *  and can win, always sending the user to the dashboard instead of back
 *  to the page they originally wanted (location.state.from). */
export default function PublicRoute() {
    const { user } = useAuth();
    const location = useLocation();

    if (user) {
        const redirectTo = (location.state as LoginRedirectState | null)?.from ?? null;
        return (
            <Navigate
                to={getSafeRedirect(redirectTo, getDashboardByRole(user.role), user.role)}
                replace
            />
        );
    }

    return <Outlet />;
}