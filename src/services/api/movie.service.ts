import axiosInstance from "@/services/axios/axiosInstance";
import type { GetMoviesResponse, Movie } from "@/features/public/types/movie.type";
import type { MovieDetail } from "@/features/movies/types/movie.types";

/**
 * GET /api/movie may return either a plain array or a paginated
 * `{ items: [...] }` object depending on the backend build, and returns
 * status in lowercase (e.g. "now_showing"). Normalize both so the rest
 * of the app can rely on an array of movies with UPPERCASE status.
 */
export const getMoviesApi = async (): Promise<GetMoviesResponse> => {
    const { data } = await axiosInstance.get("/movie");
    const list: Record<string, unknown>[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.data) ? data.data
        : [];

    return list.map((m): Movie => ({
        movieId: Number(m.movieId),
        title: String(m.title ?? ""),
        genres: Array.isArray(m.genres) ? (m.genres as string[]) : [],
        ageRating: String(m.ageRating ?? "P") as Movie["ageRating"],
        posterUrl: (m.posterUrl ?? "") as string,
        durationMinutes: Number(m.durationMinutes ?? 0),
        status: String(m.status ?? "").toUpperCase() as Movie["status"],
    }));
};

export const getMovieByIdApi = async (movieId: number): Promise<MovieDetail> => {
    const response = await axiosInstance.get(`/movie/${movieId}`);
    return response.data;
};