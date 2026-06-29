import { useState } from "react";
import type { StatusFilter } from "../components/MovieFilterBar";

export function useMovieFilters() {

    const [search, setSearch] = useState("");

    const [status, setStatus] =
        useState<StatusFilter>("ALL");

    const [genre, setGenre] = useState("");

    function resetFilters() {
        setSearch("");
        setStatus("ALL");
        setGenre("");
    }

    return {

        search,
        status,
        genre,

        setSearch,
        setStatus,
        setGenre,

        resetFilters

    };

}