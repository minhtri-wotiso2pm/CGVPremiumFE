import axiosInstance from "@/services/axios/axiosInstance";
import { normalizePersonRefs } from "@/services/api/person.service";
import type {
    MovieListItem,
    MovieListResponse,
    MovieMgmtDetail,
    CreateMoviePayload,
    UpdateMoviePayload,
    Genre,
} from "@/features/manager/types/movie-mgmt.types";

/* ── Movies ── */
/** BE returns movie status UPPERCASE (NOW_SHOWING/COMING_SOON/ENDED) and
 *  paginates with totalCount/pageIndex. Normalize to the lowercase status
 *  convention + the MovieListResponse shape the whole app assumes. */
const normalizeMovieListItem = (m: Record<string, unknown>): MovieListItem => ({
    ...(m as unknown as MovieListItem),
    movieId: Number(m.movieId ?? 0),
    title: String(m.title ?? ""),
    status: String(m.status ?? "").toLowerCase(),
});

export const getMoviesPagedApi = async (): Promise<MovieListResponse> => {
    const { data } = await axiosInstance.get("/movie", {
        params: { page: 1, pageSize: 200, sortBy: "title", sortDir: "asc" },
    });
    const rawItems: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.items ?? []);
    const items = rawItems.map(normalizeMovieListItem);
    return {
        items,
        page: Number(data?.page ?? data?.pageIndex ?? 1),
        pageSize: Number(data?.pageSize ?? items.length),
        totalItems: Number(data?.totalItems ?? data?.totalCount ?? items.length),
        totalPages: Number(data?.totalPages ?? 1),
    };
};

export const getMovieDetailApi = async (movieId: number): Promise<MovieMgmtDetail> => {
    const { data } = await axiosInstance.get(`/movie/${movieId}`);
    // Directors/actors may arrive as person objects, id arrays, or (legacy) a
    // single "director"/"cast" string — normalize to a consistent PersonRef[].
    return {
        ...data,
        movieId: Number(data.movieId ?? movieId),
        genres: Array.isArray(data.genres) ? data.genres : [],
        directors: normalizePersonRefs(data.directors ?? data.directorIds),
        actors: normalizePersonRefs(data.actors ?? data.actorIds),
    } as MovieMgmtDetail;
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
