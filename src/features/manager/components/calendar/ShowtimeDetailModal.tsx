import { type FC } from "react";
import dayjs from "dayjs";
import type { ManagerShowtime } from "../../types/showtime-mgmt.types";
import { SHOWTIME_STATUS_BADGE } from "../../constants/showtime-mgmt.constants";

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

interface Props {
    showtime: ManagerShowtime | null;
    onClose: () => void;
}

/** Read-only — the Calendar is a viewing/monitoring surface, not an edit
 *  entry point (editing already lives on the Showtime Management table). */
const ShowtimeDetailModal: FC<Props> = ({ showtime, onClose }) => {
    if (!showtime) return null;

    return (
        <div className="stt-modal-overlay" onClick={onClose}>
            <div className="stt-modal stt-modal--sm" onClick={(e) => e.stopPropagation()}>
                <div className="stt-modal__header">
                    <h2 className="stt-modal__title">Showtime Detail</h2>
                    <button className="stt-modal__close" onClick={onClose} aria-label="Close">×</button>
                </div>
                <div className="stt-modal__body">
                    <div className="stt-summary-list">
                        <div className="stt-summary-row">
                            <span className="stt-summary-row__label">Movie</span>
                            <span className="stt-summary-row__value">{showtime.movie.title}</span>
                        </div>
                        <div className="stt-summary-row">
                            <span className="stt-summary-row__label">Room</span>
                            <span className="stt-summary-row__value">{showtime.room.roomName} ({showtime.room.roomType})</span>
                        </div>
                        <div className="stt-summary-row">
                            <span className="stt-summary-row__label">Start</span>
                            <span className="stt-summary-row__value">{dayjs(showtime.startTime.slice(0, 19)).format("DD/MM/YYYY HH:mm")}</span>
                        </div>
                        <div className="stt-summary-row">
                            <span className="stt-summary-row__label">End</span>
                            <span className="stt-summary-row__value">{showtime.endTime ? dayjs(showtime.endTime.slice(0, 19)).format("HH:mm") : "—"}</span>
                        </div>
                        <div className="stt-summary-row">
                            <span className="stt-summary-row__label">Price</span>
                            <span className="stt-summary-row__value">{fmtVnd(showtime.basePrice)}</span>
                        </div>
                        <div className="stt-summary-row">
                            <span className="stt-summary-row__label">Status</span>
                            <span className={`dash-badge ${SHOWTIME_STATUS_BADGE[showtime.status] ?? "dash-badge--inactive"}`}>
                                {showtime.status.charAt(0).toUpperCase() + showtime.status.slice(1)}
                            </span>
                        </div>
                        {showtime.isSoldOut && (
                            <div className="stt-summary-row">
                                <span className="stt-summary-row__label">Availability</span>
                                <span className="dash-badge dash-badge--banned">Sold out</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowtimeDetailModal;
