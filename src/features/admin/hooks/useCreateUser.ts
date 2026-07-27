import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserApi } from "@/services/api/admin.service";
import { ADMIN_USERS_QUERY_KEY } from "../constants/admin.constants";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUserApi,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
            notify.success(res.message ?? "User created successfully");
        },
        onError: (err: unknown) => {
            notify.error("Failed to create user", getApiErrorMessage(err, "Could not create the user. Please try again."));
        },
    });
}
