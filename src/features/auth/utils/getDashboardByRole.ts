import { ROLES } from "@/constants/roles";

export const getDashboardByRole = (
    role?: string
) => {
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
};