import type { FC } from "react";
import type { Movie } from "@/features/movies/types/movie.types";
import MovieCard from "./MovieCard";
import MovieSkeleton from "./MovieSkeleton";
import MovieEmptyState from "./MovieEmptyState";
import MovieErrorState from "./MovieErrorState";
import "./movies.css";

interface Props {
    movies: Movie[];
    loading: boolean;
    error: boolean;
    sectionTitle: string;
    onCardClick: (id: number) => void;
    onBook: (id: number) => void;
    onReset: () => void;
    onRetry: () => void;
}

const MovieGrid: FC<Props> = ({
    movies, loading, error,
    sectionTitle,
    onCardClick, onBook, onReset, onRetry,
}) => (
    <section className="cgv-movie-section" aria-label={sectionTitle}>
        <div className="cgv-movie-section__heading">
            <h2 className="cgv-movie-section__title">{sectionTitle}</h2>
            <div className="cgv-movie-section__rule" aria-hidden="true" />
        </div>

        <div className="cgv-movie-grid" role="list">
            {loading && <MovieSkeleton count={10} />}

            {!loading && error && <MovieErrorState onRetry={onRetry} />}

            {!loading && !error && movies.length === 0 && (
                <MovieEmptyState onReset={onReset} />
            )}

            {!loading && !error && movies.map((m) => (
                <MovieCard
                    key={m.movieId}
                    movie={m}
                    onClick={onCardClick}
                    onBook={onBook}
                />
            ))}
        </div>
    </section>
);

export default MovieGrid;