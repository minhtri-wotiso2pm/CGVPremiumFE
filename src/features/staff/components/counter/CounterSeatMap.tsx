import { type FC, useCallback, useMemo, useState } from "react";
import { Alert, Button, Skeleton, message } from "antd";
import { useSeatMap } from "@/features/booking/hooks/useSeatMap";
import { useSeatHold } from "@/features/booking/hooks/useSeatHold";
import {
    buildCouplePairMap,
    buildSeatRowMap,
    formatPrice,
    getSeatLabel,
    isSeatSelectable,
} from "@/features/booking/utils/seat.utils";
import type { Seat } from "@/features/booking/types/seat.types";
import SeatMap from "@/features/booking/components/SeatMap";
import "@/features/booking/components/seat.css";
import styles from "./counter.module.css";

interface Props {
    showtimeId: number;
    selectedSeats: Seat[];
    onSeatsChange: (seats: Seat[]) => void;
    onContinue: (hold: { holdIds: number[]; expiresAt: string }) => void;
}

const CounterSeatMap: FC<Props> = ({ showtimeId, selectedSeats, onSeatsChange, onContinue }) => {
    const { data, isLoading, isError, refetch } = useSeatMap(showtimeId);
    const { mutate: holdSeats, isPending: isHolding } = useSeatHold();

    const [selected, setSelected] = useState<Map<number, Seat>>(
        () => new Map(selectedSeats.map((s) => [s.seatId, s])),
    );

    const seatRowMap = useMemo(
        () => (data ? buildSeatRowMap(data.seats) : new Map<string, Seat[]>()),
        [data],
    );
    const seatById = useMemo(
        () => new Map<number, Seat>((data?.seats ?? []).map((s) => [s.seatId, s])),
        [data],
    );
    const couplePairMap = useMemo(() => buildCouplePairMap(data?.seats ?? []), [data]);
    const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);
    const total = useMemo(() => Array.from(selected.values()).reduce((s, x) => s + (x.price ?? 0), 0), [selected]);

    const commit = useCallback(
        (next: Map<number, Seat>) => {
            setSelected(next);
            onSeatsChange(Array.from(next.values()));
        },
        [onSeatsChange],
    );

    const toggle = useCallback(
        (seat: Seat) => {
            if (!isSeatSelectable(seat)) return;
            const partnerId = couplePairMap.get(seat.seatId);
            const partner = partnerId != null ? seatById.get(partnerId) : undefined;
            const next = new Map(selected);

            if (partnerId != null) {
                if (!partner || !isSeatSelectable(partner)) {
                    message.warning(`Couple seat ${getSeatLabel(seat)} needs its partner, which isn't available.`);
                    return;
                }
                if (next.has(seat.seatId)) {
                    next.delete(seat.seatId);
                    next.delete(partnerId);
                } else {
                    next.set(seat.seatId, seat);
                    next.set(partnerId, partner);
                }
            } else if (next.has(seat.seatId)) {
                next.delete(seat.seatId);
            } else {
                next.set(seat.seatId, seat);
            }
            commit(next);
        },
        [selected, couplePairMap, seatById, commit],
    );

    const handleContinue = useCallback(() => {
        const seatIds = Array.from(selected.keys());
        if (seatIds.length === 0) return;
        holdSeats(
            { showtimeId, seatIds },
            {
                onSuccess: (hold) => onContinue({ holdIds: hold.holdIds, expiresAt: hold.expiresAt }),
                onError: () =>
                    message.warning("Couldn't hold those seats — one may have just been taken. Please choose again."),
            },
        );
    }, [selected, showtimeId, holdSeats, onContinue]);

    return (
        <div className="dash-card" style={{ padding: 24 }}>
            <div className={styles.stepHeadRow}>
                <div>
                    <h2 className={styles.stepHeadTitle}>Select seats</h2>
                    <p className={styles.stepHeadSub}>Tap seats on the map. Seats are held once you continue.</p>
                </div>
                {selected.size > 0 && (
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "var(--dash-text-3)" }}>{selected.size} selected</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--dash-text-1)" }}>{formatPrice(total)}</div>
                    </div>
                )}
            </div>

            {isLoading && <Skeleton active paragraph={{ rows: 6 }} />}

            {isError && (
                <Alert
                    type="error"
                    showIcon
                    message="Couldn't load the seat map."
                    action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
                />
            )}

            {!isLoading && !isError && seatRowMap.size === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "var(--dash-text-2)" }}>
                    No seats are configured for this showtime.
                </div>
            )}

            {!isLoading && !isError && seatRowMap.size > 0 && (
                <>
                    <div className={styles.seatCanvas}>
                        <SeatMap seatRowMap={seatRowMap} selectedSeatIds={selectedIds} onSeatSelect={toggle} />
                        <div className={styles.seatLegendRow}>
                            <span className={styles.seatLegendItem}><span className={styles.seatSwatch} /> Available</span>
                            <span className={styles.seatLegendItem}><span className={`${styles.seatSwatch} ${styles.seatSwatchSelected}`} /> Selected</span>
                            <span className={styles.seatLegendItem}><span className={`${styles.seatSwatch} ${styles.seatSwatchTaken}`} /> Taken</span>
                        </div>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        style={{ marginTop: 20 }}
                        loading={isHolding}
                        disabled={selected.size === 0}
                        onClick={handleContinue}
                    >
                        {selected.size === 0 ? "Select at least one seat" : `Hold ${selected.size} seat${selected.size > 1 ? "s" : ""} & continue`}
                    </Button>
                </>
            )}
        </div>
    );
};

export default CounterSeatMap;
