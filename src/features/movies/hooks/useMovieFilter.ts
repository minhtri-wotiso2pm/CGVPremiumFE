import { useMemo } from "react";
import { normalizeText } from "@/utils/string";
import type { Movie } from "../types/movie.types";
import type { StatusFilter } from "../components/MovieFilterBar";

export function useMovieFilter(
    movies: Movie[],
    search: string,
    status: StatusFilter,
    genre: string
) {

    return useMemo(() => {

        return movies.filter((movie) => {

            const matchSearch =
                !search ||
                normalizeText(movie.title).includes(
                    normalizeText(search)
                );

            const matchStatus =
                status === "ALL" ||
                movie.status === status;

            const matchGenre =
                !genre ||
                movie.genres.includes(genre);

            return (
                matchSearch &&
                matchStatus &&
                matchGenre
            );

        });

    }, [movies, search, status, genre]);

}
