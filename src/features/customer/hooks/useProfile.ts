import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { updateUserInfo } from "@/store/slices/authSlice";
import { getProfile } from "@/services/api/user.service";

export const PROFILE_QUERY_KEY = ["profile"] as const;

export const useProfile = () => {
    const dispatch = useAppDispatch();
    const query = useQuery({
        queryKey: PROFILE_QUERY_KEY,
        queryFn: getProfile,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (query.data) {
            dispatch(updateUserInfo({
                fullName:    query.data.fullName,
                phone:       query.data.phone,
                avatarURL:   query.data.avatarURL,
                totalPoints: query.data.totalPoints,
                cinema:      query.data.cinema ?? null,
            }));
        }
    }, [query.data, dispatch]);

    return query;
};