import axiosInstance from "@/services/axios/axiosInstance";
import type { GetMoviesResponse, Movie } from "@/features/public/types/movie.type";
import type { MovieDetail } from "@/features/movies/types/movie.types";

const normalizeMovie = (m: Record<string, unknown>): Movie => ({
    movieId: Number(m.movieId),
    title: String(m.title ?? ""),
    genres: Array.isArray(m.genres) ? (m.genres as string[]) : [],
    ageRating: String(m.ageRating ?? "P") as Movie["ageRating"],
    posterUrl: (m.posterUrl ?? "") as string,
    durationMinutes: Number(m.durationMinutes ?? 0),
    status: String(m.status ?? "").toUpperCase() as Movie["status"],
    ticketsSold: Number(m.ticketsSold ?? 0),
    isTopSelling: Boolean(m.isTopSelling),
    salesRank: m.salesRank == null ? null : Number(m.salesRank),
});

/** GET /api/movie is paginated (`{ items, totalCount, pageIndex, pageSize }`)
 *  but the rest of the app (grid, filters, top-selling section) needs the
 *  full catalog to work correctly — so page through it here. Some backend
 *  builds instead return a plain array with no pagination info; that's
 *  treated as "one page, done". Status is normalized to UPPERCASE (API
 *  returns it lowercase, e.g. "now_showing"). */
const MOVIE_FETCH_PAGE_SIZE = 200;

export const getMoviesApi = async (): Promise<GetMoviesResponse> => {
    const all: Record<string, unknown>[] = [];
    let pageIndex = 1;
    let totalCount: number;

    do {
        const { data } = await axiosInstance.get("/movie", {
            params: { pageIndex, pageSize: MOVIE_FETCH_PAGE_SIZE },
        });
        const list: Record<string, unknown>[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.items) ? data.items
            : Array.isArray(data?.data) ? data.data
            : [];

        all.push(...list);
        totalCount = Array.isArray(data) ? all.length : Number(data?.totalCount ?? all.length);
        if (list.length === 0) break;
        pageIndex += 1;
    } while (all.length < totalCount);

    return all.map(normalizeMovie);
};

export interface GetMoviesByGenreParams {
    genreName: string;
    status?: string;
    pageIndex?: number;
    pageSize?: number;
}

/** GET /api/movie?genreName=X&status=Y — same endpoint/response shape as
 *  getMoviesApi, filtered server-side. Used to find movies sharing a genre
 *  with the currently viewed movie for its "More Movies" section. */
export const getMoviesByGenreApi = async (params: GetMoviesByGenreParams): Promise<Movie[]> => {
    const { data } = await axiosInstance.get("/movie", {
        params: {
            genreName: params.genreName,
            status: params.status,
            pageIndex: params.pageIndex ?? 1,
            pageSize: params.pageSize ?? 10,
        },
    });
    const list: Record<string, unknown>[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.data) ? data.data
        : [];
    return list.map(normalizeMovie);
};

/**
 * GET /api/movie/{id} returns the synopsis under the field name
 * "description" (per API report), while the rest of the app reads
 * `movie.synopsis` — normalize here instead of touching every consumer.
 */
export const getMovieByIdApi = async (movieId: number): Promise<MovieDetail> => {
    const { data } = await axiosInstance.get(`/movie/${movieId}`);
    return {
        movieId: Number(data.movieId),
        title: String(data.title ?? ""),
        genres: Array.isArray(data.genres) ? (data.genres as string[]) : [],
        ageRating: String(data.ageRating ?? "P"),
        posterUrl: (data.posterUrl ?? "") as string,
        durationMinutes: Number(data.durationMinutes ?? 0),
        status: String(data.status ?? "").toUpperCase(),
        ticketsSold: Number(data.ticketsSold ?? 0),
        isTopSelling: Boolean(data.isTopSelling),
        salesRank: data.salesRank == null ? null : Number(data.salesRank),
        director: String(data.director ?? ""),
        cast: String(data.cast ?? ""),
        synopsis: String(data.synopsis ?? data.description ?? ""),
        showingFromDate: String(data.showingFromDate ?? ""),
        showingToDate: String(data.showingToDate ?? ""),
        trailerUrl: String(data.trailerUrl ?? ""),
    };
};