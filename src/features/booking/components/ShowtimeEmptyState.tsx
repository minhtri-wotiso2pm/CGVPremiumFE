import type { FC } from "react";

interface Props {
    hasCinemaOrRoomFilter: boolean;
}

const ShowtimeEmptyState: FC<Props> = ({ hasCinemaOrRoomFilter }) => (
    <div className="cgv-st-empty" role="status">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            strokeLinejoin="round" style={{ color: "var(--cgv-text-muted, #6b4a4a)" }}
            aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
        <p className="cgv-st-empty__title">No showtimes available</p>
        <p className="cgv-st-empty__subtitle">
            {hasCinemaOrRoomFilter
                ? "Try selecting a different cinema or room type."
                : "Please choose another date to see showtimes."}
        </p>
    </div>
);

export default ShowtimeEmptyState;
