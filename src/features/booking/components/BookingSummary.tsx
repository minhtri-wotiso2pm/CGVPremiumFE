import type { FC } from "react";
import type { Seat, SeatNavState } from "../types/seat.types";
import { getSeatLabel, formatPrice } from "../utils/seat.utils";

const ArrowIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

interface Props {
    selectedSeats: Map<number, Seat>;
    navState: SeatNavState;
    totalPrice: number;
    onRemoveSeat: (seatId: number) => void;
    onClearAll: () => void;
    onContinue: () => void;
    isContinueLoading?: boolean;
}

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString("vi-VN", {
            hour: "2-digit", minute: "2-digit", hour12: false,
        });
    } catch { return ""; }
}

function formatDateShort(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
        });
    } catch { return ""; }
}

const BookingSummary: FC<Props> = ({
    selectedSeats,
    navState,
    totalPrice,
    onRemoveSeat,
    onClearAll,
    onContinue,
    isContinueLoading = false,
}) => {
    const { startTime, cinemaName, roomName, roomType } = navState;
    const seats = Array.from(selectedSeats.values());
    const count = seats.length;

    return (
        <div className="cgv-seats-summary">
            <div className="cgv-seats-summary__header">
                <p className="cgv-seats-summary__title">Order Summary</p>
            </div>

            <div className="cgv-seats-summary__body">
                {/* Showtime info */}
                <div className="cgv-seats-summary-info">
                    {cinemaName && (
                        <div className="cgv-seats-summary-info-row">
                            <span className="cgv-seats-summary-info-label">Cinema</span>
                            <span className="cgv-seats-summary-info-value">{cinemaName}</span>
                        </div>
                    )}
                    {roomName && (
                        <div className="cgv-seats-summary-info-row">
                            <span className="cgv-seats-summary-info-label">Room</span>
                            <span className="cgv-seats-summary-info-value">
                                {roomName}{roomType ? ` · ${roomType}` : ""}
                            </span>
                        </div>
                    )}
                    {startTime && (
                        <div className="cgv-seats-summary-info-row">
                            <span className="cgv-seats-summary-info-label">Time</span>
                            <span className="cgv-seats-summary-info-value">
                                {formatTime(startTime)} · {formatDateShort(startTime)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Seat chips */}
                <div>
                    <div className="cgv-seats-chips">
                        {count === 0 ? (
                            <span className="cgv-seats-empty-chips">No seats selected</span>
                        ) : (
                            seats.map((seat) => (
                                <span key={seat.seatId} className="cgv-seats-chip">
                                    {getSeatLabel(seat)}
                                    <span
                                        className="cgv-seats-chip__x"
                                        role="button"
                                        aria-label={`Remove seat ${getSeatLabel(seat)}`}
                                        onClick={() => onRemoveSeat(seat.seatId)}
                                        onKeyDown={(e) => e.key === "Enter" && onRemoveSeat(seat.seatId)}
                                        tabIndex={0}
                                    >
                                        ×
                                    </span>
                                </span>
                            ))
                        )}
                    </div>
                </div>

                {/* Totals */}
                <div className="cgv-seats-total">
                    <div className="cgv-seats-total-row">
                        <span className="cgv-seats-total-label">Seats selected</span>
                        <span className="cgv-seats-total-value">{count}</span>
                    </div>
                    <div className="cgv-seats-total-row">
                        <span className="cgv-seats-total-price-label">Total</span>
                        <span className="cgv-seats-total-price-value">
                            {count > 0 ? formatPrice(totalPrice) : "—"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="cgv-seats-summary__footer">
                <button
                    className="cgv-seats-continue-btn"
                    disabled={count === 0 || isContinueLoading}
                    onClick={onContinue}
                >
                    {isContinueLoading ? "Holding seats..." : <> Continue <ArrowIcon /> </>}
                </button>
                {count > 0 && (
                    <button className="cgv-seats-clear-btn" onClick={onClearAll}>
                        Clear all seats
                    </button>
                )}
            </div>
        </div>
    );
};

export default BookingSummary;
