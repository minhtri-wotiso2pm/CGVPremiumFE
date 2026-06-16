import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { useAuth } from
    "@/features/auth/hooks/useAuth";

interface Props {
    allowedRoles: string[];
}

export default function PermissionRoute({
    allowedRoles,
}: Props) {
    const { user } = useAuth();

    console.log("=== PermissionRoute ===");
    console.log("USER:", user);
    console.log("ALLOWED:", allowedRoles);

    if (!user) {
        return (
            <Navigate
                to="/login"
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