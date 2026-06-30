import { type FC, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSeatMap } from "../hooks/useSeatMap";
import {
    buildSeatRowMap,
    isSeatSelectable,
    formatPrice,
    getSeatTypes,
} from "../utils/seat.utils";
import type { Seat, SeatNavState } from "../types/seat.types";
import SeatSelectionHeader from "../components/SeatSelectionHeader";
import SeatMap from "../components/SeatMap";
import SeatLegend from "../components/SeatLegend";
import BookingSummary from "../components/BookingSummary";
import SeatSelectionSkeleton from "../components/SeatSelectionSkeleton";
import "../components/seat.css";

const SeatSelectionPage: FC = () => {
    const { showtimeId: showtimeIdStr } = useParams<{ showtimeId: string }>();
    const navigate  = useNavigate();
    const location  = useLocation();
    const navState  = (location.state ?? {}) as SeatNavState;
    const showtimeId = Number(showtimeIdStr);

    const [selectedSeats, setSelectedSeats] = useState<Map<number, Seat>>(new Map());

    const { data, isLoading, isError, refetch } = useSeatMap(showtimeId);

    const seatRowMap = useMemo(
        () => (data ? buildSeatRowMap(data.seats) : new Map<string, Seat[]>()),
        [data]
    );

    const selectedSeatIds = useMemo(
        () => new Set<number>(selectedSeats.keys()),
        [selectedSeats]
    );

    const seatTypes  = useMemo(() => getSeatTypes(seatRowMap), [seatRowMap]);
    const hasVip     = seatTypes.has("VIP");
    const hasCouple  = seatTypes.has("COUPLE");

    const totalPrice = useMemo(
        () => Array.from(selectedSeats.values()).reduce((sum, s) => sum + (s.price ?? 0), 0),
        [selectedSeats]
    );

    const toggleSeat = useCallback((seat: Seat) => {
        if (!isSeatSelectable(seat)) return;
        setSelectedSeats((prev) => {
            const next = new Map(prev);
            if (next.has(seat.seatId)) {
                next.delete(seat.seatId);
            } else {
                next.set(seat.seatId, seat);
            }
            return next;
        });
    }, []);

    const removeSeat = useCallback((seatId: number) => {
        setSelectedSeats((prev) => {
            const next = new Map(prev);
            next.delete(seatId);
            return next;
        });
    }, []);

    const clearAll = useCallback(() => setSelectedSeats(new Map()), []);

    const handleContinue = useCallback(() => {
        navigate("/customer/booking/payment", {
            state: {
                showtimeId,
                selectedSeats: Array.from(selectedSeats.values()),
                ...navState,
            },
        });
    }, [navigate, showtimeId, selectedSeats, navState]);

    if (isLoading) return <SeatSelectionSkeleton />;

    if (isError) {
        return (
            <div className="cgv-seats-page">
                <div className="cgv-seats-container">
                    <div className="cgv-seats-state">
                        <p className="cgv-seats-state__title">Unable to load seat map</p>
                        <p className="cgv-seats-state__body">
                            Please check your connection and try again.
                        </p>
                        <button className="cgv-seats-retry-btn" onClick={() => refetch()}>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedCount = selectedSeats.size;

    return (
        <div className="cgv-seats-page cgv-seats-fade-in">
            <div className="cgv-seats-container">
                {/* Movie / showtime info card */}
                <SeatSelectionHeader navState={navState} />

                {/* Main layout */}
                <div className="cgv-seats-layout">
                    {/* Left — theater + legend */}
                    <div className="cgv-seats-left">
                        <div className="cgv-seats-map-wrapper">
                            {seatRowMap.size === 0 ? (
                                <div className="cgv-seats-state">
                                    <p className="cgv-seats-state__title">No seats found</p>
                                    <p className="cgv-seats-state__body">
                                        This showtime has no seats configured yet.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <SeatMap
                                        seatRowMap={seatRowMap}
                                        selectedSeatIds={selectedSeatIds}
                                        onSeatSelect={toggleSeat}
                                    />
                                    <SeatLegend hasVip={hasVip} hasCouple={hasCouple} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right — sticky summary (desktop) */}
                    <aside className="cgv-seats-right">
                        <BookingSummary
                            selectedSeats={selectedSeats}
                            navState={navState}
                            totalPrice={totalPrice}
                            onRemoveSeat={removeSeat}
                            onClearAll={clearAll}
                            onContinue={handleContinue}
                        />
                    </aside>
                </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="cgv-seats-mobile-bar" aria-live="polite">
                <div>
                    <div className="cgv-seats-mobile-bar__count">
                        {selectedCount > 0
                            ? `${selectedCount} seat${selectedCount > 1 ? "s" : ""} selected`
                            : "No seats selected"}
                    </div>
                    {selectedCount > 0 && (
                        <div className="cgv-seats-mobile-bar__price">
                            {formatPrice(totalPrice)}
                        </div>
                    )}
                </div>
                <button
                    className="cgv-seats-continue-btn"
                    disabled={selectedCount === 0}
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default SeatSelectionPage;
