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

export default MovieStatusBadge;