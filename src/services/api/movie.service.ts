import axiosInstance from "@/services/axios/axiosInstance";
import type { GetMoviesResponse } from "@/features/public/types/movie.type";
import type { MovieDetail } from "@/features/movies/types/movie.types";

export const getMoviesApi = async (): Promise<GetMoviesResponse> => {
    const response = await axiosInstance.get("/movie");
    return response.data;
};

export const getMovieByIdApi = async (movieId: number): Promise<MovieDetail> => {
    const response = await axiosInstance.get(`/movie/${movieId}`);
    return response.data;
};