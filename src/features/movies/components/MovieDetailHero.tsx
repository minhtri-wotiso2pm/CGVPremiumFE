import type { FC } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MovieDetail } from "../types/movie.types";
import type { PersonRef } from "@/features/persons/types/person.types";
import MovieStatusBadge, { AgeBadge } from "./MovieStatusBadge";
import { formatDuration, formatShowingDate } from "../utils/movie.utils";
import { useMovieNavigation } from "../hooks/useMovieNavigation";
import { useMovieRatingSummary } from "@/features/reviews/hooks/useMovieReviews";
import StarRating from "@/features/reviews/components/StarRating";
import "@/features/reviews/components/reviews.css";
import "./movies.css";

const FALLBACK =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23120505'/%3E%3Ctext x='150' y='230' text-anchor='middle' fill='%235a4040' font-size='16' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

interface Props {
    movie: MovieDetail;
    onWatchTrailer: () => void;
    onBook?: (id: number) => void;
    /** Path prefix for person links ("" for public, "/customer" for customer). */
    personBase?: string;
}

/** Render a list of people as clickable profile links, comma-separated. */
const PeopleLinks: FC<{ people: PersonRef[]; base: string }> = ({ people, base }) => (
    <>
        {people.map((p, i) => (
            <span key={p.id}>
                {i > 0 && ", "}
                <Link to={`${base}/persons/${p.id}`} className="cgv-detail-hero__person-link">{p.name}</Link>
            </span>
        ))}
    </>
);

const MovieDetailHero: FC<Props> = ({ movie, onWatchTrailer, onBook, personBase = "" }) => {
    const { t } = useTranslation("movies");
    const { goBooking } = useMovieNavigation();
    const handleBook = onBook ?? goBooking;
    const { data: rating } = useMovieRatingSummary(movie.movieId);
    const poster = movie.posterUrl || FALLBACK;
    const hasDirectors = (movie.directors?.length ?? 0) > 0;
    const hasActors = (movie.actors?.length ?? 0) > 0;

    return (
        <section className="cgv-detail-hero" aria-label={t("detail.aria")}>
            {/* Blurred background */}
            <div
                className="cgv-detail-hero__bg"
                style={{ backgroundImage: `url(${poster})` }}
                aria-hidden="true"
            />
            <div className="cgv-detail-hero__overlay" aria-hidden="true" />

            {/* Content */}
            <div className="cgv-detail-hero__content">
                {/* Poster */}
                <div className="cgv-detail-hero__poster-wrap">
                    <img
                        src={poster}
                        alt={t("card.posterAlt", { title: movie.title })}
                        className="cgv-detail-hero__poster"
                        onError={(e) => { e.currentTarget.src = FALLBACK; }}
                    />
                    <div className="cgv-detail-hero__poster-age">
                        <AgeBadge rating={movie.ageRating} />
                    </div>
                </div>

                {/* Info */}
                <div className="cgv-detail-hero__info">
                    {/* Genres */}
                    <div className="cgv-detail-hero__genres">
                        {movie.genres.map((g) => (
                            <span key={g} className="cgv-detail-hero__genre-tag">{g}</span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="cgv-detail-hero__title">{movie.title}</h1>

                    {/* Status + Duration */}
                    <div className="cgv-detail-hero__badges">
                        <MovieStatusBadge status={movie.status} />
                        <span className="cgv-detail-hero__duration">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            {formatDuration(movie.durationMinutes)}
                        </span>
                        {rating?.averageRating != null && (
                            <span className="rv-hero-badge">
                                <StarRating value={rating.averageRating} size={14} />
                                <span className="rv-hero-badge__num">{rating.averageRating.toFixed(1)}</span>
                                <span className="rv-hero-badge__count">
                                    ({rating.totalReviews})
                                </span>
                            </span>
                        )}
                    </div>

                    {/* Meta grid */}
                    <dl className="cgv-detail-hero__meta">
                        {(hasDirectors || movie.director) && (
                            <>
                                <dt>{t("detail.director", { count: movie.directors?.length ?? 1 })}</dt>
                                <dd>
                                    {hasDirectors
                                        ? <PeopleLinks people={movie.directors} base={personBase} />
                                        : movie.director}
                                </dd>
                            </>
                        )}
                        {(hasActors || movie.cast) && (
                            <>
                                <dt>{t("detail.cast")}</dt>
                                <dd>
                                    {hasActors
                                        ? <PeopleLinks people={movie.actors} base={personBase} />
                                        : movie.cast}
                                </dd>
                            </>
                        )}
                        <dt>{t("detail.showing")}</dt>
                        <dd>
                            {formatShowingDate(movie.showingFromDate)}
                            {" — "}
                            {formatShowingDate(movie.showingToDate)}
                        </dd>
                    </dl>

                    {/* Actions */}
                    <div className="cgv-detail-hero__actions">
                        <button
                            className="cgv-detail-btn cgv-detail-btn--primary"
                            onClick={() => handleBook(movie.movieId)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
                            >
                                <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" />
                                <path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                            </svg>
                            {t("actions.bookNow")}
                        </button>

                        {movie.trailerUrl && (
                            <button
                                className="cgv-detail-btn cgv-detail-btn--outline"
                                onClick={onWatchTrailer}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                {t("actions.watchTrailer")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MovieDetailHero;
