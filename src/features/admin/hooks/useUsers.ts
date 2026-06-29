import { useQuery } from "@tanstack/react-query";
import { getUsersApi } from "@/services/api/admin.service";
import { ADMIN_USERS_QUERY_KEY } from "../constants/admin.constants";
import type { GetUsersParams } from "../types/user.types";

export function useUsers(params: GetUsersParams) {
    return useQuery({
        queryKey: [...ADMIN_USERS_QUERY_KEY, params],
        queryFn: () => getUsersApi(params),
        placeholderData: (prev) => prev,
    });
}
