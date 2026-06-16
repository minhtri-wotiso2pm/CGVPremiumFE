import { ROLES } from "@/constants/roles";

export const getDashboardByRole = (
    role?: string
) => {
    switch (role) {
        case ROLES.ADMIN:
            return "/admin/dashboard";

        case ROLES.MANAGER:
            return "/manager/dashboard";

        case ROLES.STAFF:
            return "/staff/dashboard";

        case ROLES.CUSTOMER:
            return "/customer/dashboard";

        default:
            return "/";
    }
};