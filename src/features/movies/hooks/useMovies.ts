import type { Movie } from "@/features/public/types/movie.type";
import { getMoviesApi } from "@/services/api/movie.service";
import { useCallback, useEffect, useState } from "react";

export function useMovies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await getMoviesApi();
            setMovies(response);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies();
    }, []);

    return {
        movies,
        loading,
        error,
        refetch: fetchMovies,
    };
}