import { type FC } from "react";
import { useTranslation } from "react-i18next";
import type { Movie } from "@/features/movies/types/movie.types";
import { formatDuration } from "@/features/movies/utils/movie.utils";
import { RankBadge } from "@/features/movies/components/MovieStatusBadge";
import { useParallaxStyle } from "./useParallax";

interface Props {
    movie: Movie;
    synopsis?: string;
    direction: 1 | -1;
    onBook: (movieId: number) => void;
    onDetails: (movieId: number) => void;
}

const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

/** OverlayInfoPanel — Netflix-style text directly on top of the media
 *  (never a split-screen layout). Re-keyed per movie so the parallax
 *  drift + fade replay on every slide change. */
const HeroOverlayInfo: FC<Props> = ({ movie, synopsis, direction, onBook, onDetails }) => {
    const { t } = useTranslation("movies");
    const parallaxStyle = useParallaxStyle(direction);

    return (
        <div className="cgv-hoverlay cgv-hoverlay--parallax" style={parallaxStyle}>
            <div className="cgv-hoverlay__eyebrow-row">
                <p className="cgv-hoverlay__eyebrow">
                    {movie.status === "NOW_SHOWING" ? t("status.nowShowing") : t("status.comingSoon")}
                </p>
                <RankBadge rank={movie.salesRank} isTopSelling={movie.isTopSelling} />
            </div>

            <h1 className="cgv-hoverlay__title">{movie.title}</h1>

            <div className="cgv-hoverlay__meta">
                <span className="cgv-hoverlay__age-badge">{movie.ageRating}</span>
                <span>{movie.genres.slice(0, 3).join(" • ")}</span>
                <span>{formatDuration(movie.durationMinutes)}</span>
            </div>

            {synopsis && <p className="cgv-hoverlay__desc">{synopsis}</p>}

            <div className="cgv-hoverlay__cta-row">
                <button className="cgv-hoverlay__cta cgv-hoverlay__cta--primary" onClick={() => onBook(movie.movieId)}>
                    <PlayIcon />
                    {t("actions.bookNow")}
                </button>
                <button className="cgv-hoverlay__cta cgv-hoverlay__cta--secondary" onClick={() => onDetails(movie.movieId)}>
                    {t("actions.details")}
                </button>
            </div>
        </div>
    );
};

export default HeroOverlayInfo;
