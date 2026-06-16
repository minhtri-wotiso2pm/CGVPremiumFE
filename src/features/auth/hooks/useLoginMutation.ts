import { useMutation } from "@tanstack/react-query";

import { loginApi } from "@/services/api/auth.service";

export const useLoginMutation = () =>
    useMutation({
        mutationFn: loginApi,
    });