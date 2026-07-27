import { type FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ShowtimeCinema, ShowtimeItem } from "../types/showtime.types";
import ShowtimeCard from "./ShowtimeCard";
import ShowtimeEmptyState from "./ShowtimeEmptyState";

interface Props {
    showtimes: ShowtimeItem[];
    isError: boolean;
    hasCinemaOrRoomFilter: boolean;
    onSelect: (showtimeId: number) => void;
    onRetry: () => void;
}

interface CinemaGroup {
    cinema: ShowtimeCinema;
    showtimes: ShowtimeItem[];
}

/** Groups showtimes by cinema, preserving first-seen order (the list is
 *  already sorted by startTime from the API). */
function groupByCinema(showtimes: ShowtimeItem[]): CinemaGroup[] {
    const groups = new Map<number, CinemaGroup>();
    for (const s of showtimes) {
        const existing = groups.get(s.cinema.cinemaId);
        if (existing) existing.showtimes.push(s);
        else groups.set(s.cinema.cinemaId, { cinema: s.cinema, showtimes: [s] });
    }
    return Array.from(groups.values());
}

const ShowtimeGrid: FC<Props> = ({ showtimes, isError, hasCinemaOrRoomFilter, onSelect, onRetry }) => {
    const { t } = useTranslation("booking");
    // Only worth grouping when showtimes actually span more than one
    // cinema — e.g. "All Cinemas" is selected. A single-cinema result
    // (whether from an explicit filter or just having one cinema showing
    // the movie) renders as a plain flat grid, unchanged.
    const groups = useMemo(() => groupByCinema(showtimes), [showtimes]);
    const shouldGroup = groups.length > 1;

    if (isError) {
        return (
            <div className="cgv-st-error" role="alert">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: "var(--cgv-text-muted, #6b4a4a)" }} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="cgv-st-error__title">{t("showtime.errorTitle")}</p>
                <p className="cgv-st-error__body">{t("showtime.errorBody")}</p>
                <button className="cgv-st-retry-btn" onClick={onRetry}>{t("common:actions.tryAgain")}</button>
            </div>
        );
    }

    if (showtimes.length === 0) {
        return <ShowtimeEmptyState hasCinemaOrRoomFilter={hasCinemaOrRoomFilter} />;
    }

    if (!shouldGroup) {
        return (
            <div className="cgv-st-grid cgv-st-fade-in" role="list" aria-label={t("showtime.availableShowtimes")}>
                {showtimes.map((s) => (
                    <ShowtimeCard key={s.showtimeId} showtime={s} onSelect={onSelect} />
                ))}
            </div>
        );
    }

    return (
        <div className="cgv-st-cinema-groups cgv-st-fade-in">
            {groups.map(({ cinema, showtimes: cinemaShowtimes }) => (
                <section key={cinema.cinemaId} className="cgv-st-cinema-group" aria-label={cinema.cinemaName}>
                    <div className="cgv-st-cinema-group__header">
                        <span className="cgv-st-cinema-group__name">{cinema.cinemaName}</span>
                        {cinema.address && (
                            <span className="cgv-st-cinema-group__address">{cinema.address}</span>
                        )}
                    </div>
                    <div className="cgv-st-grid" role="list" aria-label={t("showtime.showtimesAt", { cinema: cinema.cinemaName })}>
                        {cinemaShowtimes.map((s) => (
                            <ShowtimeCard key={s.showtimeId} showtime={s} onSelect={onSelect} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default ShowtimeGrid;
