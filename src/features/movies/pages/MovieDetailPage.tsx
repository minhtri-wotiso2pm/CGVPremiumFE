import { useRef, useCallback, type FC } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useMovieDetail } from "../hooks/useMovieDetail";
import { useMovies } from "../hooks/useMovies";
import MovieDetailHero from "../components/MovieDetailHero";
import MovieDetailTrailer from "../components/MovieDetailTrailer";
import MovieDetailSkeleton from "../components/MovieDetailSkeleton";
import MovieCard from "../components/MovieCard";
import { useMovieNavigation } from "../hooks/useMovieNavigation";
import "../components/movies.css";

const MovieDetailPage: FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const id = Number(movieId);
    const navigate = useNavigate();
    const location = useLocation();
    const { goMovieDetail, goBooking } = useMovieNavigation();

    const user = useAppSelector((state) => state.auth.user);
    const isPublic = location.pathname.startsWith("/movies/");
    const homeLink = isPublic ? "/" : "/customer";
    const moviesLink = isPublic ? "/" : "/customer";

    const handleBook = useCallback((id: number) => {
        if (!user) {
            navigate("/login");
        } else {
            goBooking(id);
        }
    }, [user, navigate, goBooking]);
    const trailerRef = useRef<HTMLDivElement>(null);

    const { data: movie, isLoading, isError } = useMovieDetail(id);
    const { movies } = useMovies();

    const related = movies.filter((m) => m.movieId !== id).slice(0, 10);

    const scrollToTrailer = () => {
        trailerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    /* ── Loading ── */
    if (isLoading) {
        return (
            <div style={{ background: "var(--cgv-bg)", minHeight: "100vh", padding: "0 0 60px" }}>
                <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
                    <MovieDetailSkeleton />
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (isError || !movie) {
        return (
            <div style={{ background: "var(--cgv-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="cgv-state-card">
                    <div className="cgv-state-card__icon-ring">
                        <span className="cgv-state-card__icon">⚠️</span>
                    </div>
                    <h2 className="cgv-state-card__title">Movie not found</h2>
                    <p className="cgv-state-card__body">We couldn't load this movie. It may have been removed or the link is invalid.</p>
                    <button className="cgv-state-card__btn cgv-state-card__btn--primary" onClick={() => navigate("/customer/movies")}>
                        Back to Movies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "var(--cgv-bg)", minHeight: "100vh" }} className="cgv-fade-in">

            {/* ── Breadcrumb ── */}
            <nav aria-label="Breadcrumb" className="cgv-detail-breadcrumb">
                <div className="cgv-detail-breadcrumb__inner">
                    <Link to={homeLink} className="cgv-detail-breadcrumb__link">Home</Link>
                    <span className="cgv-detail-breadcrumb__sep" aria-hidden="true">›</span>
                    <Link to={moviesLink} className="cgv-detail-breadcrumb__link">Movies</Link>
                    <span className="cgv-detail-breadcrumb__sep" aria-hidden="true">›</span>
                    <span className="cgv-detail-breadcrumb__current" aria-current="page">{movie.title}</span>
                </div>
            </nav>

            {/* ── Hero ── */}
            <MovieDetailHero movie={movie} onWatchTrailer={scrollToTrailer} onBook={handleBook} />

            {/* ── Body sections ── */}
            <div className="cgv-detail-body">

                {/* Synopsis */}
                {movie.synopsis && (
                    <section className="cgv-detail-section" aria-labelledby="synopsis-heading">
                        <h2 className="cgv-detail-section__title" id="synopsis-heading">Synopsis</h2>
                        <p className="cgv-detail-synopsis">{movie.synopsis}</p>
                    </section>
                )}

                {/* Trailer */}
                {movie.trailerUrl && (
                    <section className="cgv-detail-section" aria-labelledby="trailer-heading" ref={trailerRef}>
                        <h2 className="cgv-detail-section__title" id="trailer-heading">Trailer</h2>
                        <MovieDetailTrailer trailerUrl={movie.trailerUrl} title={movie.title} />
                    </section>
                )}

                {/* Related movies */}
                {related.length > 0 && (
                    <section className="cgv-detail-section" aria-labelledby="related-heading">
                        <div className="cgv-movie-section__heading">
                            <h2 className="cgv-movie-section__title" id="related-heading">More Movies</h2>
                            <div className="cgv-movie-section__rule" aria-hidden="true" />
                        </div>
                        <div className="cgv-movie-grid">
                            {related.map((m) => (
                                <MovieCard
                                    key={m.movieId}
                                    movie={m}
                                    onClick={goMovieDetail}
                                    onBook={goBooking}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default MovieDetailPage;
