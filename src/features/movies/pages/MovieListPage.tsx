/**
 * MovieListPage
 *
 * Responsibility:
 * - Fetch movies
 * - Manage filters
 * - Manage pagination
 * - Connect UI components
 *
 * Data Flow:
 * API
 *   ↓
 * Filters
 *   ↓
 * Pagination
 *   ↓
 * UI
 */

/* React */
import { type FC, useCallback, useRef } from "react";

/* Components */
import MovieHero from "@/features/movies/components/MovieHero";
import MovieFilterBar from "@/features/movies/components/MovieFilterBar";
import MovieGrid from "@/features/movies/components/MovieGrid";
import MoviePagination from "@/features/movies/components/MoviePagination";

/* Hooks */
import { useMovies } from "@/features/movies/hooks/useMovies";
import { useMovieFilters } from "@/features/movies/hooks/useMovieFilters";
import { useMovieFilter } from "@/features/movies/hooks/useMovieFilter";
import { useMovieNavigation } from "@/features/movies/hooks/useMovieNavigation";
import { usePagination } from "@/hooks/usePagination";

/* Constants */
import { MOVIE_PAGE_SIZE } from "@/features/movies/constants/movie.constants";

/* Utils */
import {
    getFeaturedMovie,
    getMovieGenres,
    getMovieSectionTitle,
} from "@/features/movies/utils/movie.utils";

const MovieListPage: FC = () => {

    /* Data */
    const {

        movies,
        loading,
        error,
        refetch

    } = useMovies();

    /* Filters */
    const {

        search,
        status,
        genre,

        setSearch,
        setStatus,
        setGenre,

        resetFilters

    } = useMovieFilters();

    /* Refs */
    const gridRef = useRef<HTMLDivElement>(null);

    /* Derived Data */
    const allGenres = getMovieGenres(movies);

    const filtered = useMovieFilter(

        movies,
        search,
        status,
        genre

    );

    const sectionTitle = getMovieSectionTitle(
        status,
        search,
        genre
    );

    const featuredMovie = getFeaturedMovie(movies);

    /* Pagination */
    const {
        page,
        setPage,
        totalPages,
        currentItems
    } = usePagination(
        filtered,
        MOVIE_PAGE_SIZE,
        [search, status, genre]
    );

    /* Navigation */
    const {

        goMovieDetail,
        goBooking

    } = useMovieNavigation();

    /* Event Handlers */
    const handleReset = useCallback(() => {
        resetFilters();
        setPage(1);
    }, [resetFilters, setPage]);

    const handleBrowseScroll = useCallback(() => {
        gridRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, []);

    /* Render */
    return (
        <main style={{ background: "var(--cgv-bg)", minHeight: "100vh" }}>
            {/* Hero */}
            <MovieHero
                featuredMovie={featuredMovie}
                totalMovies={movies.length}
                onBrowse={handleBrowseScroll}
            />

            {/* Sticky filter bar */}
            <MovieFilterBar
                search={search}
                status={status}
                genre={genre}
                genres={allGenres}
                totalCount={movies.length}
                filteredCount={filtered.length}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onGenreChange={setGenre}
            />

            {/* Movie grid */}
            <div ref={gridRef}>
                <MovieGrid
                    movies={currentItems}
                    loading={loading}
                    error={error}
                    sectionTitle={sectionTitle}
                    onCardClick={goMovieDetail}
                    onBook={goBooking}
                    onReset={handleReset}
                    onRetry={refetch}
                />
            </div>

            {/* Pagination */}
            {!loading && !error && filtered.length > MOVIE_PAGE_SIZE && (
                <MoviePagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}
        </main>
    );
};

export default MovieListPage;