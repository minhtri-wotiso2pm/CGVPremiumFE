import { useCallback, useState } from "react";
import type { StatusFilter } from "../components/MovieFilterBar";

export function useMovieFilters() {

    const [search, setSearch] = useState("");

    const [status, setStatus] =
        useState<StatusFilter>("ALL");

    /* Multi-select genres — empty array means "All Genres". */
    const [genres, setGenres] = useState<string[]>([]);

    /* Toggle a single genre in/out of the active selection. */
    const toggleGenre = useCallback((genre: string) => {
        setGenres((prev) =>
            prev.includes(genre)
                ? prev.filter((g) => g !== genre)
                : [...prev, genre]
        );
    }, []);

    function resetFilters() {
        setSearch("");
        setStatus("ALL");
        setGenres([]);
    }

    return {

        search,
        status,
        genres,

        setSearch,
        setStatus,
        setGenres,
        toggleGenre,

        resetFilters

    };

}
