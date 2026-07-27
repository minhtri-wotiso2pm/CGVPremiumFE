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
import { type FC, useCallback } from "react";
import { useTranslation } from "react-i18next";

/* Components */
import MovieHero from "@/features/movies/components/MovieHero";
import TopSellingSection from "@/features/movies/components/TopSellingSection";
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
    getFeaturedMovies,
    getTopSellingCarouselMovies,
    getMovieGenres,
    getMovieSectionTitle,
} from "@/features/movies/utils/movie.utils";

interface Props {
    onMovieClick?: (id: number) => void;
    onBook?: (id: number) => void;
}

const MovieListPage: FC<Props> = ({ onMovieClick, onBook }) => {

    const { t } = useTranslation("movies");

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
        genres,

        setSearch,
        setStatus,
        setGenres,
        toggleGenre,

        resetFilters

    } = useMovieFilters();

    /* Derived Data */
    const allGenres = getMovieGenres(movies);

    const filtered = useMovieFilter(

        movies,
        search,
        status,
        genres

    );

    const sectionTitleKey = getMovieSectionTitle(
        status,
        search,
        genres
    );
    const sectionTitle = t(sectionTitleKey.key, sectionTitleKey.params);

    const featuredMovies = getFeaturedMovies(movies, 3);
    const topSellingMovies = getTopSellingCarouselMovies(movies, 10);

    /* Pagination */
    const {
        page,
        setPage,
        totalPages,
        currentItems
    } = usePagination(
        filtered,
        MOVIE_PAGE_SIZE,
        [search, status, genres]
    );

    /* Navigation */
    const {

        goMovieDetail,
        goBooking

    } = useMovieNavigation();

    const handleMovieClick = onMovieClick ?? goMovieDetail;
    const handleBook = onBook ?? goBooking;

    /* Event Handlers */
    const handleReset = useCallback(() => {
        resetFilters();
        setPage(1);
    }, [resetFilters, setPage]);

    /* Render */
    return (
        <main style={{ background: "var(--cgv-bg)", minHeight: "100vh" }}>
            {/* Hero */}
            <MovieHero
                featuredMovies={featuredMovies}
                totalMovies={movies.length}
                onMovieClick={handleMovieClick}
                onBook={handleBook}
            />

            {/* Top selling carousel */}
            <TopSellingSection
                movies={topSellingMovies}
                onCardClick={handleMovieClick}
                onBook={handleBook}
            />

            {/* Sticky filter bar */}
            <MovieFilterBar
                search={search}
                status={status}
                genres={genres}
                allGenres={allGenres}
                totalCount={movies.length}
                filteredCount={filtered.length}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onGenreToggle={toggleGenre}
                onGenresClear={() => setGenres([])}
            />

            {/* Movie grid */}
            <MovieGrid
                movies={currentItems}
                loading={loading}
                error={error}
                sectionTitle={sectionTitle}
                onCardClick={handleMovieClick}
                onBook={handleBook}
                onReset={handleReset}
                onRetry={refetch}
            />

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