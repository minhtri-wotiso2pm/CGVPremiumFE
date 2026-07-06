import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import { useAuth } from
    "@/features/auth/hooks/useAuth";
import { buildLoginRedirectState } from "@/features/auth/utils/authRedirect";

interface Props {
    allowedRoles: string[];
}

export default function PermissionRoute({
    allowedRoles,
}: Props) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return (
            <Navigate
                to="/login"
                state={buildLoginRedirectState(location)}
                replace
            />
        );
    }

    if (
        !allowedRoles.includes(
            user.role
        )
    ) {
        return (
            <Navigate
                to="/403"
                replace
            />
        );
    }

    return <Outlet />;
}