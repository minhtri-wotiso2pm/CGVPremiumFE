import type { FC } from "react";
import "./movies.css";

interface Props {
    status: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    NOW_SHOWING: { label: "Now Showing", cls: "cgv-badge--now-showing" },
    COMING_SOON: { label: "Coming Soon", cls: "cgv-badge--coming-soon" },
};

const MovieStatusBadge: FC<Props> = ({ status }) => {
    if (!status) return null;
    const config = STATUS_MAP[status] ?? { label: status, cls: "cgv-badge--default" };
    return (
        <span className={`cgv-badge ${config.cls}`}>
            <span className="cgv-badge__dot" aria-hidden="true" />
            {config.label}
        </span>
    );
};

/* Age rating badge */
interface AgeBadgeProps { rating: string }

const AGE_CLS: Record<string, string> = {
    P: "cgv-age-badge--pg",
    PG: "cgv-age-badge--pg",
    C13: "cgv-age-badge--c13",
    C16: "cgv-age-badge--c16",
    C18: "cgv-age-badge--c18",
};

export const AgeBadge: FC<AgeBadgeProps> = ({ rating }) => {
    const cls = AGE_CLS[rating.toUpperCase()] ?? "cgv-age-badge--default";
    return <span className={`cgv-age-badge ${cls}`}>{rating}</span>;
};

/** Top-selling rank badge: gold/silver/bronze medal for rank 1-3, generic
 *  "HOT" badge for any other top seller (rank 4+ or no rank). Renders
 *  nothing for movies that aren't marked as top-selling. */
interface RankBadgeProps { rank: number | null; isTopSelling: boolean }

export const RankBadge: FC<RankBadgeProps> = ({ rank, isTopSelling }) => {
    if (!isTopSelling) return null;
    if (rank === 1) return <span className="cgv-rank-badge cgv-rank-badge--gold">Top 1</span>;
    if (rank === 2) return <span className="cgv-rank-badge cgv-rank-badge--silver">Top 2</span>;
    if (rank === 3) return <span className="cgv-rank-badge cgv-rank-badge--bronze">Top 3</span>;
    return <span className="cgv-rank-badge cgv-rank-badge--hot">Hot Trending</span>;
};

export default MovieStatusBadge;