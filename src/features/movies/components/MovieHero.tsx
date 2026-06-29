import type { FC } from "react";
import type { Movie } from "@/features/movies/types/movie.types";
import "./movies.css";

interface Props {
    featuredMovie: Movie | null;
    totalMovies: number;
    onBrowse: () => void;
}

const HERO_FALLBACK_BG = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&q=80";

const MovieHero: FC<Props> = ({ featuredMovie, totalMovies, onBrowse }) => {
    const bgImage = featuredMovie?.posterUrl
        ? `url(${featuredMovie.posterUrl})`
        : `url(${HERO_FALLBACK_BG})`;

    return (
        <section className="cgv-hero" aria-label="Featured movies hero">
            {/* Blurred background */}
            <div
                className="cgv-hero__bg"
                style={{ backgroundImage: bgImage }}
                aria-hidden="true"
            />
            <div className="cgv-hero__overlay" aria-hidden="true" />

            <div className="cgv-hero__content">
                <p className="cgv-hero__eyebrow">CGVPremium</p>

                <h1 className="cgv-hero__title">
                    <em>Now Showing</em>
                </h1>

                <p className="cgv-hero__subtitle">
                    Discover the latest blockbuster movies and book your seats instantly.
                </p>

                <button className="cgv-hero__cta" onClick={onBrowse}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        strokeLinejoin="round" aria-hidden="true"
                    >
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Browse Movies
                </button>

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