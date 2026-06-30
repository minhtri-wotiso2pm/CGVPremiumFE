import type { FC } from "react";
import type { SeatNavState } from "../types/seat.types";

const LocationIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ClockIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const AGE_RATING_BG: Record<string, string> = {
    P:   "#4caf50",
    K:   "#2196f3",
    T13: "#ff9800",
    T16: "#ff5722",
    T18: "#f44336",
    C18: "#9c27b0",
};

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("vi-VN", {
            weekday: "short",
            day:     "2-digit",
            month:   "2-digit",
            year:    "numeric",
        });
    } catch {
        return iso;
    }
}

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString("vi-VN", {
            hour:   "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "";
    }
}

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? `${m}m` : ""}` : `${m}m`;
}

interface Props {
    navState: SeatNavState;
}

const SeatSelectionHeader: FC<Props> = ({ navState }) => {
    const {
        movieTitle,
        moviePoster,
        movieDuration,
        movieAgeRating,
        startTime,
        cinemaName,
        roomName,
        roomType,
    } = navState;

    const ageBg = movieAgeRating ? (AGE_RATING_BG[movieAgeRating] ?? "#888") : null;

    if (!movieTitle && !cinemaName && !startTime) return null;

    return (
        <div className="cgv-seats-info-card cgv-seats-fade-in">
            {moviePoster ? (
                <img
                    src={moviePoster}
                    alt={movieTitle ?? "Movie"}
                    className="cgv-seats-info-poster"
                    loading="eager"
                />
            ) : (
                <div className="cgv-seats-info-poster-placeholder" aria-hidden="true" />
            )}

            <div className="cgv-seats-info-body">
                {movieTitle && (
                    <h1 className="cgv-seats-info-title">{movieTitle}</h1>
                )}

                <div className="cgv-seats-info-badges">
                    {movieAgeRating && ageBg && (
                        <span
                            className="cgv-seats-age-badge"
                            style={{ "--age-color": ageBg } as React.CSSProperties}
                            aria-label={`Age rating: ${movieAgeRating}`}
                        >
                            {movieAgeRating}
                        </span>
                    )}
                    {movieDuration && (
                        <span className="cgv-seats-duration-badge">
                            <ClockIcon />
                            {formatDuration(movieDuration)}
                        </span>
                    )}
                </div>

                <div className="cgv-seats-info-meta">
                    {cinemaName && (
                        <span className="cgv-seats-meta-item">
                            <LocationIcon />
                            {cinemaName}
                        </span>
                    )}
                    {roomName && (
                        <span className="cgv-seats-meta-item">
                            {roomName}
                            {roomType ? ` · ${roomType}` : ""}
                        </span>
                    )}
                </div>

                {startTime && (
                    <div className="cgv-seats-datetime" aria-label="Showtime">
                        <CalendarIcon />
                        {formatDate(startTime)} · {formatTime(startTime)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeatSelectionHeader;
