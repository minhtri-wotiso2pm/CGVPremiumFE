import { type FC, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSeatMap } from "../hooks/useSeatMap";
import { useSeatHold } from "../hooks/useSeatHold";
import {
    buildSeatRowMap,
    isSeatSelectable,
    formatPrice,
    getSeatTypes,
    getSeatLabel,
    buildCouplePairMap,
} from "../utils/seat.utils";
import type { Seat, SeatNavState } from "../types/seat.types";
import { notify } from "@/utils/notify";
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
    const { mutate: holdSeats, isPending: isHolding } = useSeatHold();

    const { data, isLoading, isError, refetch } = useSeatMap(showtimeId);

    const seatRowMap = useMemo(
        () => (data ? buildSeatRowMap(data.seats) : new Map<string, Seat[]>()),
        [data]
    );

    const seatById = useMemo(
        () => new Map<number, Seat>((data?.seats ?? []).map((s) => [s.seatId, s])),
        [data]
    );

    const couplePairMap = useMemo(
        () => buildCouplePairMap(data?.seats ?? []),
        [data]
    );

    const selectedSeatIds = useMemo(
        () => new Set<number>(selectedSeats.keys()),
        [selectedSeats]
    );

    /* Realtime sync: if a selected seat gets taken by another customer
       between polls, drop it from the selection and warn the user. */
    const isFirstDataRef = useRef(true);
    useEffect(() => {
        if (!data) return;
        if (isFirstDataRef.current) {
            isFirstDataRef.current = false;
            return;
        }
        setSelectedSeats((prev) => {
            if (prev.size === 0) return prev;
            const latestById = new Map(data.seats.map((s) => [s.seatId, s]));
            const stillValid = new Map<number, Seat>();
            const lostSeats: Seat[] = [];
            for (const [id, seat] of prev) {
                const latest = latestById.get(id);
                if (latest && isSeatSelectable(latest)) {
                    stillValid.set(id, latest);
                } else {
                    lostSeats.push(seat);
                }
            }
            if (lostSeats.length > 0) {
                notify.warning(
                    "Ghế vừa được đặt",
                    `${lostSeats.map(getSeatLabel).join(", ")} vừa được người khác giữ hoặc mua. Vui lòng chọn ghế khác.`
                );
                return stillValid;
            }
            return prev;
        });
    }, [data]);

    const seatTypes  = useMemo(() => getSeatTypes(seatRowMap), [seatRowMap]);
    const hasVip     = seatTypes.has("VIP");
    const hasCouple  = seatTypes.has("COUPLE");
    const hasEconomy = seatTypes.has("ECONOMY");
    const hasPoor    = seatTypes.has("POOR");

    const totalPrice = useMemo(
        () => Array.from(selectedSeats.values()).reduce((sum, s) => sum + (s.price ?? 0), 0),
        [selectedSeats]
    );

    const toggleSeat = useCallback((seat: Seat) => {
        if (!isSeatSelectable(seat)) return;

        // Couple seats are sold as a pair — toggle both halves together.
        const partnerId = couplePairMap.get(seat.seatId);
        const partner = partnerId != null ? seatById.get(partnerId) : undefined;

        if (partnerId != null) {
            if (!partner || !isSeatSelectable(partner)) {
                notify.warning(
                    "Không thể chọn ghế đôi",
                    `Ghế đôi ${getSeatLabel(seat)} phải chọn cả cặp, nhưng ghế đi kèm hiện không khả dụng.`
                );
                return;
            }
            setSelectedSeats((prev) => {
                const next = new Map(prev);
                if (next.has(seat.seatId)) {
                    next.delete(seat.seatId);
                    next.delete(partnerId);
                } else {
                    next.set(seat.seatId, seat);
                    next.set(partnerId, partner);
                }
                return next;
            });
            return;
        }

        setSelectedSeats((prev) => {
            const next = new Map(prev);
            if (next.has(seat.seatId)) {
                next.delete(seat.seatId);
            } else {
                next.set(seat.seatId, seat);
            }
            return next;
        });
    }, [couplePairMap, seatById]);

    const removeSeat = useCallback((seatId: number) => {
        setSelectedSeats((prev) => {
            const next = new Map(prev);
            next.delete(seatId);
            const partnerId = couplePairMap.get(seatId);
            if (partnerId != null) next.delete(partnerId);
            return next;
        });
    }, [couplePairMap]);

    const clearAll = useCallback(() => setSelectedSeats(new Map()), []);

    const handleContinue = useCallback(() => {
        const seatIds = Array.from(selectedSeats.keys());
        holdSeats(
            { showtimeId, seatIds },
            {
                onSuccess: (holdData) => {
                    navigate("/customer/booking/fnb", {
                        state: {
                            showtimeId,
                            seatIds,
                            selectedSeats: Array.from(selectedSeats.values()),
                            holdIds: holdData.holdIds,
                            holdExpiresAt: holdData.expiresAt,
                            ...navState,
                        },
                    });
                },
                onError: () => {
                    notify.warning(
                        "Không thể giữ ghế",
                        "Ghế bạn chọn có thể đã được đặt. Vui lòng chọn lại."
                    );
                },
            }
        );
    }, [navigate, showtimeId, selectedSeats, navState, holdSeats]);

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
                                    <SeatLegend hasVip={hasVip} hasCouple={hasCouple} hasEconomy={hasEconomy} hasPoor={hasPoor} />
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
                            isContinueLoading={isHolding}
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
                    disabled={selectedCount === 0 || isHolding}
                    onClick={handleContinue}
                >
                    {isHolding ? "Đang giữ ghế..." : "Continue"}
                </button>
            </div>
        </div>
    );
};

export default SeatSelectionPage;
