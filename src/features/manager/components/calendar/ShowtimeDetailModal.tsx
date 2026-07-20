import { type FC } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import type { ManagerShowtime } from "../../types/showtime-mgmt.types";

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const STATUS_DOT: Record<string, string> = {
    scheduled: "#22c55e",
    completed: "#E65100",
    cancelled: "#9ca3af",
};

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
    </svg>
);

const Row: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="cal-dv__row">
        <span className="cal-dv__row-label">{label}</span>
        <span className="cal-dv__row-value">{children}</span>
    </div>
);

interface Props {
    showtime: ManagerShowtime | null;
    onClose: () => void;
    onEdit?: (showtime: ManagerShowtime) => void;
    onDelete?: (showtime: ManagerShowtime) => void;
}

const ShowtimeDetailModal: FC<Props> = ({ showtime, onClose, onEdit, onDelete }) => {
    if (!showtime) return null;

    const start = dayjs(showtime.startTime.slice(0, 19));
    const end = showtime.endTime ? dayjs(showtime.endTime.slice(0, 19)) : null;
    const durationMin = end ? end.diff(start, "minute") : showtime.movie.durationMin ?? null;
    const statusLabel = showtime.status.charAt(0).toUpperCase() + showtime.status.slice(1);

    return createPortal(
        <div className="stt-modal-overlay" onClick={onClose}>
            <div className="stt-modal cal-dv" onClick={(e) => e.stopPropagation()}>
                <button className="cal-dv__close" onClick={onClose} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                </button>

                {/* Header */}
                <div className="cal-dv__header">
                    {showtime.movie.posterUrl ? (
                        <img className="cal-dv__poster" src={showtime.movie.posterUrl} alt={showtime.movie.title} />
                    ) : (
                        <div className="cal-dv__poster cal-dv__poster--empty" />
                    )}
                    <div className="cal-dv__headinfo">
                        <span className="cal-dv__eyebrow">Showtime · #{showtime.showtimeId}</span>
                        <h2 className="cal-dv__title">{showtime.movie.title}</h2>
                        <div className="cal-dv__chips">
                            {showtime.movie.ageRating && <span className="cal-dv__chip">{showtime.movie.ageRating}</span>}
                            {durationMin ? <span className="cal-dv__chip cal-dv__chip--soft">{durationMin} min</span> : null}
                        </div>
                        <span className="cal-dv__status">
                            <span className="cal-dv__status-dot" style={{ background: STATUS_DOT[showtime.status] ?? "#9ca3af" }} />
                            {statusLabel}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="cal-dv__body">
                    <section className="cal-dv__section">
                        <span className="cal-dv__section-label">Schedule</span>
                        <Row label="Date">{start.format("dddd, DD/MM/YYYY")}</Row>
                        <Row label="Time">
                            <span className="cal-dv__time">{start.format("HH:mm")}{end ? ` – ${end.format("HH:mm")}` : ""}</span>
                        </Row>
                    </section>

                    <section className="cal-dv__section">
                        <span className="cal-dv__section-label">Venue</span>
                        <Row label="Room">{showtime.room.roomName}</Row>
                        <Row label="Screen type">{showtime.room.roomType}</Row>
                        {showtime.room.capacity ? <Row label="Capacity">{showtime.room.capacity} seats</Row> : null}
                    </section>

                    <section className="cal-dv__section">
                        <span className="cal-dv__section-label">Pricing</span>
                        <Row label="Base price"><span className="cal-dv__price">{fmtVnd(showtime.basePrice)}</span></Row>
                        <Row label="Availability">
                            {showtime.isSoldOut
                                ? <span className="cal-dv__avail cal-dv__avail--sold">Sold out</span>
                                : <span className="cal-dv__avail cal-dv__avail--ok">Available</span>}
                        </Row>
                    </section>
                </div>

                {/* Footer */}
                {(onEdit || onDelete) && (
                    <div className="cal-dv__footer">
                        {onDelete && (
                            <button className="cal-dv__btn cal-dv__btn--danger" onClick={() => onDelete(showtime)}>
                                <TrashIcon /> Delete
                            </button>
                        )}
                        {onEdit && (
                            <button className="cal-dv__btn cal-dv__btn--primary" onClick={() => onEdit(showtime)}>
                                <EditIcon /> Edit showtime
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
};

export default ShowtimeDetailModal;
