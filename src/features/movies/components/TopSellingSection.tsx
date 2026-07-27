import { type CSSProperties, type FC, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Movie } from "@/features/movies/types/movie.types";
import "./movies.css";

const FireIcon: FC = () => (
    <svg
        className="cgv-fire-icon"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <defs>
            <radialGradient id="fire-glow" cx="0.5" cy="0.55" r="0.55">
                <stop offset="0" stopColor="#FF6B00" stopOpacity="0.5" />
                <stop offset="0.6" stopColor="#FF4500" stopOpacity="0.15" />
                <stop offset="1" stopColor="#FF4500" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="fire-body" x1="12" y1="1" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#E53935" />
                <stop offset="0.35" stopColor="#FF6D00" />
                <stop offset="0.7" stopColor="#FFB300" />
                <stop offset="1" stopColor="#FFD600" />
            </linearGradient>
            <linearGradient id="fire-core" x1="12" y1="8" x2="12" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#FFF9C4" />
                <stop offset="0.5" stopColor="#FFEE58" />
                <stop offset="1" stopColor="#FFB300" />
            </linearGradient>
            <linearGradient id="fire-spark" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#FFD600" stopOpacity="1" />
                <stop offset="1" stopColor="#FF6D00" stopOpacity="0" />
            </linearGradient>
        </defs>
        {/* outer glow — wider, brighter */}
        <ellipse className="cgv-fire-icon__glow" cx="12" cy="14" rx="10" ry="9" fill="url(#fire-glow)" />
        {/* main flame body */}
        <path
            className="cgv-fire-icon__body"
            d="M12 1C12 1 4.5 9.5 4.5 14.5C4.5 18.5 7.8 22 12 22C16.2 22 19.5 18.5 19.5 14.5C19.5 9.5 12 1 12 1Z"
            fill="url(#fire-body)"
        />
        {/* inner bright core */}
        <path
            className="cgv-fire-icon__core"
            d="M12 8C12 8 8 12.5 8 15.5C8 17.99 9.79 20 12 20C14.21 20 16 17.99 16 15.5C16 12.5 12 8 12 8Z"
            fill="url(#fire-core)"
        />
        {/* glossy highlight glint — occasional shimmer pass for a polished look */}
        <ellipse
            className="cgv-fire-icon__shine"
            cx="10.2"
            cy="9.8"
            rx="1.2"
            ry="2.6"
            fill="#FFFFFF"
            transform="rotate(-18 10.2 9.8)"
        />
        {/* spark particles — small floating embers */}
        <circle className="cgv-fire-icon__spark cgv-fire-icon__spark--1" cx="8" cy="5" r="0.8" fill="url(#fire-spark)" />
        <circle className="cgv-fire-icon__spark cgv-fire-icon__spark--2" cx="16" cy="4" r="0.6" fill="url(#fire-spark)" />
        <circle className="cgv-fire-icon__spark cgv-fire-icon__spark--3" cx="10" cy="3" r="0.5" fill="url(#fire-spark)" />
    </svg>
);

interface Props {
    /** Top sellers first (by salesRank) then Now Showing fillers — see
     *  getTopSellingCarouselMovies. Never includes Ended movies. */
    movies: Movie[];
    onCardClick: (id: number) => void;
    onBook: (id: number) => void;
}

const FALLBACK_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23120505'/%3E%3Ctext x='100' y='155' text-anchor='middle' fill='%235a4040' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

const ChevronIcon: FC<{ direction: "left" | "right" }> = ({ direction }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
);

/** Position badge: gold/silver/bronze medal for the top 3, a generic "Top N"
 *  badge for the rest — every card in this carousel gets one, since the
 *  list is already ordered by popularity (real salesRank first, then
 *  tickets sold for the filler movies). */
const PositionBadge: FC<{ position: number }> = ({ position }) => {
    const { t } = useTranslation("movies");
    const label = t("rank.top", { rank: position });
    if (position === 1) return <span className="cgv-rank-badge cgv-rank-badge--gold">{label}</span>;
    if (position === 2) return <span className="cgv-rank-badge cgv-rank-badge--silver">{label}</span>;
    if (position === 3) return <span className="cgv-rank-badge cgv-rank-badge--bronze">{label}</span>;
    return <span className="cgv-rank-badge cgv-rank-badge--hot">{label}</span>;
};

/** Scale/opacity/z-index per tier, keyed by distance from the active card:
 *  0 = active (biggest), 1 = immediate neighbor (bigger than far, smaller
 *  than active), 2+ = far cards (smallest). */
const TIERS = [
    { scale: 1.32, opacity: 1, z: 3, grayscale: 0 },
    { scale: 1.04, opacity: 0.85, z: 2, grayscale: 0.15 },
    { scale: 0.78, opacity: 0.5, z: 1, grayscale: 0.35 },
];

const tierFor = (distance: number) => TIERS[Math.min(Math.abs(distance), TIERS.length - 1)];

/** Signed distance from `activeIndex` to `index`, taking the shortest path
 *  around the circular list (so wrapping from the last card back to the
 *  first is a short +1 hop, not a sweep across the whole carousel). */
function wrappedDistance(index: number, activeIndex: number, n: number): number {
    let d = index - activeIndex;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
}

/** Spotlight carousel: cards keep a fixed order (never re-sorted) and are
 *  absolutely positioned by their signed distance from `activeIndex`, so
 *  moving to the next/previous movie animates as a real horizontal slide
 *  (via CSS transition on transform) instead of an instant swap. Looping
 *  is circular — Next past the last movie wraps to the first, and vice
 *  versa for Prev. */
const TopSellingSection: FC<Props> = ({ movies, onCardClick, onBook }) => {
    const { t } = useTranslation("movies");
    const [activeIndex, setActiveIndex] = useState(0);
    const n = movies.length;

    if (n === 0) return null;

    const goPrev = () => setActiveIndex((i) => (i - 1 + n) % n);
    const goNext = () => setActiveIndex((i) => (i + 1) % n);

    return (
        <section className="cgv-movie-section cgv-top-selling" aria-label={t("topSelling.aria")}>
            <div className="cgv-movie-section__heading">
                <h2 className="cgv-movie-section__title"><FireIcon /> {t("topSelling.title")}</h2>
                <div className="cgv-movie-section__rule" aria-hidden="true" />
            </div>

            <div className="cgv-tsell">
                {n > 1 && (
                    <button
                        className="cgv-tsell__nav cgv-tsell__nav--prev"
                        onClick={goPrev}
                        aria-label={t("topSelling.showPrev")}
                    >
                        <ChevronIcon direction="left" />
                    </button>
                )}

                <div className="cgv-tsell__row">
                    {movies.map((m, index) => {
                        const distance = wrappedDistance(index, activeIndex, n);
                        const isActive = distance === 0;
                        const tier = tierFor(distance);
                        const style: CSSProperties & { "--tsell-distance": number } = {
                            "--tsell-distance": distance,
                            transform: `translate(-50%, -50%) translateX(calc(var(--tsell-distance) * var(--tsell-spacing))) scale(${tier.scale})`,
                            opacity: tier.opacity,
                            zIndex: tier.z,
                            filter: tier.grayscale ? `grayscale(${tier.grayscale})` : "none",
                        };

                        return (
                            <div
                                key={m.movieId}
                                className={`cgv-tsell__card${isActive ? " cgv-tsell__card--active" : ""}`}
                                style={style}
                                onClick={() => (isActive ? onCardClick(m.movieId) : setActiveIndex(index))}
                                onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ") return;
                                    if (isActive) onCardClick(m.movieId);
                                    else setActiveIndex(index);
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={isActive ? t("card.cardAria", { title: m.title }) : t("topSelling.showMovie", { title: m.title })}
                            >
                                <div className="cgv-tsell__poster-wrap">
                                    <img
                                        src={m.posterUrl || FALLBACK_POSTER}
                                        alt={t("card.posterAlt", { title: m.title })}
                                        className="cgv-tsell__poster"
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.src = FALLBACK_POSTER; }}
                                    />
                                    <div className="cgv-tsell__rank">
                                        <PositionBadge position={index + 1} />
                                    </div>

                                    {isActive && (
                                        <div className="cgv-tsell__info">
                                            <h3 className="cgv-tsell__title" title={m.title}>{m.title}</h3>
                                            <div className="cgv-tsell__actions">
                                                <button
                                                    className="cgv-tsell__btn cgv-tsell__btn--primary"
                                                    onClick={(e) => { e.stopPropagation(); onBook(m.movieId); }}
                                                >
                                                    {t("actions.bookNow")}
                                                </button>
                                                <button
                                                    className="cgv-tsell__btn cgv-tsell__btn--secondary"
                                                    onClick={(e) => { e.stopPropagation(); onCardClick(m.movieId); }}
                                                >
                                                    {t("actions.details")}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {n > 1 && (
                    <button
                        className="cgv-tsell__nav cgv-tsell__nav--next"
                        onClick={goNext}
                        aria-label={t("topSelling.showNext")}
                    >
                        <ChevronIcon direction="right" />
                    </button>
                )}
            </div>
        </section>
    );
};

export default TopSellingSection;
