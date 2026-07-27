import { useMemo } from "react";
import { normalizeText } from "@/utils/string";
import type { Movie } from "../types/movie.types";
import type { StatusFilter } from "../components/MovieFilterBar";

export function useMovieFilter(
    movies: Movie[],
    search: string,
    status: StatusFilter,
    genres: string[]
) {

    return useMemo(() => {

        return movies.filter((movie) => {

            if (movie.status?.toUpperCase() === "ENDED") return false;

            const matchSearch =
                !search ||
                normalizeText(movie.title).includes(
                    normalizeText(search)
                );

            const matchStatus =
                status === "ALL" ||
                movie.status === status;

            /* No genre selected → match all. Otherwise the movie must
               contain at least one of the selected genres (OR logic,
               same as real cinema sites). */
            const matchGenre =
                genres.length === 0 ||
                genres.some((g) => movie.genres.includes(g));

            return (
                matchSearch &&
                matchStatus &&
                matchGenre
            );

        });

    }, [movies, search, status, genres]);

}
