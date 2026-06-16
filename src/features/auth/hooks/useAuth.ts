import { useAppSelector } from "@/store/hooks";

export const useAuth = () => {
    const auth = useAppSelector(
        (state) => state.auth
    );

    return auth;
};