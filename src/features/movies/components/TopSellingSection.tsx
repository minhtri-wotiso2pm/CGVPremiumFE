import { type CSSProperties, type FC, useState } from "react";
import type { Movie } from "@/features/movies/types/movie.types";
import "./movies.css";

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
    if (position === 1) return <span className="cgv-rank-badge cgv-rank-badge--gold">Top 1</span>;
    if (position === 2) return <span className="cgv-rank-badge cgv-rank-badge--silver">Top 2</span>;
    if (position === 3) return <span className="cgv-rank-badge cgv-rank-badge--bronze">Top 3</span>;
    return <span className="cgv-rank-badge cgv-rank-badge--hot">Top {position}</span>;
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
    const [activeIndex, setActiveIndex] = useState(0);
    const n = movies.length;

    if (n === 0) return null;

    const goPrev = () => setActiveIndex((i) => (i - 1 + n) % n);
    const goNext = () => setActiveIndex((i) => (i + 1) % n);

    return (
        <section className="cgv-movie-section cgv-top-selling" aria-label="Top Selling Movies">
            <div className="cgv-movie-section__heading">
                <h2 className="cgv-movie-section__title">🔥 Top Selling This Week</h2>
                <div className="cgv-movie-section__rule" aria-hidden="true" />
            </div>

            <div className="cgv-tsell">
                {n > 1 && (
                    <button
                        className="cgv-tsell__nav cgv-tsell__nav--prev"
                        onClick={goPrev}
                        aria-label="Show previous movie"
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
                                aria-label={isActive ? `${m.title} — click to view details` : `Show ${m.title}`}
                            >
                                <div className="cgv-tsell__poster-wrap">
                                    <img
                                        src={m.posterUrl || FALLBACK_POSTER}
                                        alt={`Poster for ${m.title}`}
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
                                                    Book Now
                                                </button>
                                                <button
                                                    className="cgv-tsell__btn cgv-tsell__btn--secondary"
                                                    onClick={(e) => { e.stopPropagation(); onCardClick(m.movieId); }}
                                                >
                                                    Details
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
                        aria-label="Show next movie"
                    >
                        <ChevronIcon direction="right" />
                    </button>
                )}
            </div>
        </section>
    );
};

export default TopSellingSection;
