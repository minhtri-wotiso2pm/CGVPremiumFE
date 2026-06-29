import axiosInstance from "@/services/axios/axiosInstance";

import type {
    GetMoviesResponse,
} from "@/features/public/types/movie.type";

export const getMoviesApi =
    async (): Promise<GetMoviesResponse> => {
        const response =
            await axiosInstance.get(
                "/movie"
            );

        return response.data;
    };