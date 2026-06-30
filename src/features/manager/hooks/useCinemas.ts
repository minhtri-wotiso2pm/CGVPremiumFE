import { useQuery } from "@tanstack/react-query";
import { getCinemasApi } from "@/services/api/manager.service";
import { CINEMA_QUERY_KEY } from "../constants/cinema.constants";

export function useCinemas() {
    return useQuery({
        queryKey: CINEMA_QUERY_KEY,
        queryFn: getCinemasApi,
        staleTime: 5 * 60 * 1000,
    });
}
