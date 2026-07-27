import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { Movie } from "@/features/movies/types/movie.types";
import MovieStatusBadge, { AgeBadge, RankBadge } from "./MovieStatusBadge";
import "./movies.css";

interface Props {
    movie: Movie;
    onClick: (id: number) => void;
    onBook?: (id: number) => void;
    /** Show the "Book Now" overlay button. Off on the person filmography. */
    showBook?: boolean;
}

/** Duration formatter: 130 → "2h 10m" */
function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

const FALLBACK_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23120505'/%3E%3Ctext x='100' y='155' text-anchor='middle' fill='%235a4040' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

const MovieCard: FC<Props> = ({ movie, onClick, onBook, showBook = true }) => {
    const { t } = useTranslation("movies");
    const { movieId, title, genres, ageRating, posterUrl, durationMinutes, status, isTopSelling, salesRank } = movie;

    return (
        <article
            className="cgv-card"
            onClick={() => onClick(movieId)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(movieId); }}
            tabIndex={0}
            role="button"
            aria-label={t("card.cardAria", { title })}
        >
            {/* Poster */}
            <div className="cgv-card__poster-wrap">
                <img
                    src={posterUrl || FALLBACK_POSTER}
                    alt={t("card.posterAlt", { title })}
                    className="cgv-card__poster"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget).src = FALLBACK_POSTER; }}
                />

                {/* Age rating — top left of poster */}
                <div className="cgv-card__age">
                    <AgeBadge rating={ageRating} />
                </div>

                {/* Sales rank — top right of poster */}
                {isTopSelling && (
                    <div className="cgv-card__rank">
                        <RankBadge rank={salesRank} isTopSelling={isTopSelling} />
                    </div>
                )}

                {/* Hover overlay */}
                <div className="cgv-card__overlay" aria-hidden="true">
                    {showBook && (
                        <button
                            className="cgv-card__overlay-btn cgv-card__overlay-btn--primary"
                            onClick={(e) => { e.stopPropagation(); onBook?.(movieId); }}
                            tabIndex={-1}
                        >
                            {t("actions.bookNow")}
                        </button>
                    )}
                    <button
                        className="cgv-card__overlay-btn cgv-card__overlay-btn--secondary"
                        onClick={(e) => { e.stopPropagation(); onClick(movieId); }}
                        tabIndex={-1}
                    >
                        {t("actions.viewDetail")}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="cgv-card__body">
                <h3 className="cgv-card__title" title={title}>{title}</h3>

                <div className="cgv-card__genres">
                    {genres.slice(0, 2).map((g) => (
                        <span key={g} className="cgv-card__genre-tag">{g}</span>
                    ))}
                </div>

                <div className="cgv-card__meta">
                    <MovieStatusBadge status={status} />

                    <span className="cgv-card__duration">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatDuration(durationMinutes)}
                    </span>
                </div>
            </div>
        </article>
    );
};

export default MovieCard;