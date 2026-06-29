import type { FC } from "react";
import type { ShowtimeItem } from "../types/showtime.types";
import ShowtimeCard from "./ShowtimeCard";
import ShowtimeEmptyState from "./ShowtimeEmptyState";

interface Props {
    showtimes: ShowtimeItem[];
    isError: boolean;
    hasCinemaOrRoomFilter: boolean;
    onSelect: (showtimeId: number) => void;
    onRetry: () => void;
}

const ShowtimeGrid: FC<Props> = ({ showtimes, isError, hasCinemaOrRoomFilter, onSelect, onRetry }) => {
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
                <p className="cgv-st-error__title">Không thể tải lịch chiếu</p>
                <p className="cgv-st-error__body">Đã xảy ra lỗi kết nối. Vui lòng thử lại.</p>
                <button className="cgv-st-retry-btn" onClick={onRetry}>Thử lại</button>
            </div>
        );
    }

    if (showtimes.length === 0) {
        return <ShowtimeEmptyState hasCinemaOrRoomFilter={hasCinemaOrRoomFilter} />;
    }

    return (
        <div className="cgv-st-grid cgv-st-fade-in" role="list" aria-label="Available showtimes">
            {showtimes.map((s) => (
                <ShowtimeCard key={s.showtimeId} showtime={s} onSelect={onSelect} />
            ))}
        </div>
    );
};

export default ShowtimeGrid;
