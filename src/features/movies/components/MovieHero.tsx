import { type FC, useCallback, useEffect, useState } from "react";
import type { Movie } from "@/features/movies/types/movie.types";
import { formatDuration } from "@/features/movies/utils/movie.utils";
import { SPLASH_TOTAL_MS } from "@/components/common/SplashScreen/SplashScreen";
import { useIntroEntrance } from "@/components/common/SplashScreen/useIntroEntrance";
import "./movies.css";

interface Props {
    featuredMovies: Movie[];
    totalMovies: number;
    onMovieClick: (movieId: number) => void;
    onBook: (movieId: number) => void;
}

const HERO_FALLBACK_BG = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&q=80";
const AUTOPLAY_MS = 5000;

const MovieHero: FC<Props> = ({ featuredMovies, totalMovies, onMovieClick, onBook }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    /* Splash-synced entrance — fades in together with the floating header */
    const playIntro = useIntroEntrance();

    const slideCount = featuredMovies.length;
    // Clamp in case the movie list shrinks (e.g. filters change upstream) —
    // derived instead of synced via effect, so there's no extra render.
    const safeIndex = activeIndex < slideCount ? activeIndex : 0;

    /* Autoplay — pauses on hover, skips entirely for prefers-reduced-motion */
    useEffect(() => {
        if (slideCount <= 1 || isPaused) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const id = setInterval(() => {
            setActiveIndex((i) => (i + 1) % slideCount);
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [slideCount, isPaused]);

    const goPrev = useCallback(() => {
        setActiveIndex((i) => (i - 1 + slideCount) % slideCount);
    }, [slideCount]);

    const goNext = useCallback(() => {
        setActiveIndex((i) => (i + 1) % slideCount);
    }, [slideCount]);

    const activeMovie = featuredMovies[safeIndex] as Movie | undefined;

    return (
        <section
            className={`cgv-hero${playIntro ? " cgv-hero--intro" : ""}`}
            style={playIntro ? { animationDelay: `${SPLASH_TOTAL_MS + 60}ms` } : undefined}
            aria-label="Featured movies hero"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Cross-fading background layers — all posters pre-rendered, only opacity animates */}
            {featuredMovies.map((movie, i) => (
                <div
                    key={movie.movieId}
                    className="cgv-hero__bg"
                    style={{
                        backgroundImage: `url(${movie.posterUrl || HERO_FALLBACK_BG})`,
                        opacity: i === safeIndex ? 1 : 0,
                    }}
                    aria-hidden="true"
                />
            ))}
            {featuredMovies.length === 0 && (
                <div className="cgv-hero__bg" style={{ backgroundImage: `url(${HERO_FALLBACK_BG})`, opacity: 1 }} aria-hidden="true" />
            )}
            <div className="cgv-hero__overlay" aria-hidden="true" />

            {/* Prev / next arrows */}
            {slideCount > 1 && (
                <>
                    <button
                        type="button"
                        className="cgv-hero__nav cgv-hero__nav--prev"
                        onClick={goPrev}
                        aria-label="Previous movie"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="cgv-hero__nav cgv-hero__nav--next"
                        onClick={goNext}
                        aria-label="Next movie"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </>
            )}

            <div className="cgv-hero__content">
                {activeMovie ? (
                    <div key={activeMovie.movieId} className="cgv-hero__slide">
                        <p className="cgv-hero__eyebrow">
                            {activeMovie.status === "NOW_SHOWING" ? "Now Showing" : "Coming Soon"}
                        </p>

                        <h1 className="cgv-hero__title">{activeMovie.title}</h1>

                        <p className="cgv-hero__meta">
                            {activeMovie.genres.slice(0, 3).join(" • ")}
                            {activeMovie.genres.length > 0 && " • "}
                            {formatDuration(activeMovie.durationMinutes)}
                            {" • "}
                            <span className="cgv-hero__age-badge">{activeMovie.ageRating}</span>
                        </p>

                        <div className="cgv-hero__cta-row">
                            <button
                                className="cgv-hero__cta cgv-hero__cta--primary"
                                onClick={() => onBook(activeMovie.movieId)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                    strokeLinejoin="round" aria-hidden="true"
                                >
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                Book Now
                            </button>
                            <button
                                className="cgv-hero__cta cgv-hero__cta--secondary"
                                onClick={() => onMovieClick(activeMovie.movieId)}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="cgv-hero__slide">
                        <p className="cgv-hero__eyebrow">CGVPremium</p>
                        <h1 className="cgv-hero__title"><em>Now Showing</em></h1>
                        <p className="cgv-hero__meta">Discover the latest blockbuster movies and book your seats instantly.</p>
                    </div>
                )}

                {/* Stats row */}
                <div className="cgv-hero__stats" aria-label="Cinema statistics">
                    <div className="cgv-hero__stat">
                        <span className="cgv-hero__stat-value">{totalMovies}+</span>
                        <span className="cgv-hero__stat-label">Movies</span>
                    </div>
                    <div className="cgv-hero__stat">
                        <span className="cgv-hero__stat-value">12</span>
                        <span className="cgv-hero__stat-label">Theaters</span>
                    </div>
                    <div className="cgv-hero__stat">
                        <span className="cgv-hero__stat-value">4K</span>
                        <span className="cgv-hero__stat-label">Premium screens</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MovieHero;
