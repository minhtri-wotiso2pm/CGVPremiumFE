import axiosInstance from "@/services/axios/axiosInstance";
import type {
    MovieListResponse,
    MovieMgmtDetail,
    CreateMoviePayload,
    UpdateMoviePayload,
    Genre,
} from "@/features/manager/types/movie-mgmt.types";

/* ── Movies ── */
export const getMoviesPagedApi = async (): Promise<MovieListResponse> => {
    const { data } = await axiosInstance.get("/movie", {
        params: { page: 1, pageSize: 200, sortBy: "title", sortDir: "asc" },
    });
    if (Array.isArray(data)) return { items: data, page: 1, pageSize: data.length, totalItems: data.length, totalPages: 1 };
    return data as MovieListResponse;
};

export const getMovieDetailApi = async (movieId: number): Promise<MovieMgmtDetail> => {
    const { data } = await axiosInstance.get(`/movie/${movieId}`);
    return data;
};

export const createMovieApi = async (payload: CreateMoviePayload): Promise<MovieMgmtDetail> => {
    const { data } = await axiosInstance.post("/movie", payload);
    return data;
};

export const updateMovieApi = async (
    movieId: number,
    payload: UpdateMoviePayload,
): Promise<MovieMgmtDetail> => {
    const { data } = await axiosInstance.put(`/movie/${movieId}`, payload);
    return data;
};

export const uploadMoviePosterApi = async (
    movieId: number,
    file: File,
): Promise<{ posterUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axiosInstance.put(`/movie/${movieId}/poster`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

export const deleteMovieApi = async (movieId: number): Promise<void> => {
    await axiosInstance.delete(`/movie/${movieId}`);
};

/* ── Genres ── */
export const getGenresApi = async (): Promise<Genre[]> => {
    const { data } = await axiosInstance.get("/genres");
    return Array.isArray(data) ? data : (data.items ?? []);
};

export const createGenreApi = async (genreName: string): Promise<Genre> => {
    const { data } = await axiosInstance.post("/genres", { genreName });
    return data;
};

export const updateGenreApi = async (genreId: number, genreName: string): Promise<Genre> => {
    const { data } = await axiosInstance.put(`/genres/${genreId}`, { genreName });
    return data;
};

export const deleteGenreApi = async (genreId: number): Promise<void> => {
    await axiosInstance.delete(`/genres/${genreId}`);
};
