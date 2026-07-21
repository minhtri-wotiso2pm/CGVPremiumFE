import type { FC, ReactNode } from "react";
import type { Seat } from "@/features/booking/types/seat.types";
import type { PricingResponse } from "@/features/booking/types/payment.types";
import { formatPrice, getSeatLabel } from "@/features/booking/utils/seat.utils";
import type { CounterFnbLine, CounterMode, CounterShowtime } from "../../types/counter.types";
import type { LookedUpMember } from "../../types/lookup.types";
import { FilmIcon } from "./icons";
import styles from "./counter.module.css";

interface Props {
    mode: CounterMode | null;
    showtime: CounterShowtime | null;
    selectedSeats: Seat[];
    fnbLines: CounterFnbLine[];
    member: LookedUpMember | null;
    customerResolved: boolean;
    voucherCode: string | null;
    seatsSubtotal: number;
    fnbSubtotal: number;
    /** Raw (no-discount) fallback total, shown instantly while `pricing` loads. */
    estimatedTotal: number;
    /** Real discount-applied pricing, once the shared query resolves. */
    pricing: PricingResponse | null;
    /** Step-specific action buttons rendered at the bottom of the rail. */
    children?: ReactNode;
}

const fmtTime = (iso: string) => {
    try {
        return new Date(iso).toLocaleString("en-US", {
            weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
        });
    } catch {
        return iso;
    }
};

const OrderRail: FC<Props> = ({
    mode, showtime, selectedSeats, fnbLines, member, customerResolved, voucherCode,
    seatsSubtotal, fnbSubtotal, estimatedTotal, pricing, children,
}) => {
    const hasAnything = !!showtime || selectedSeats.length > 0 || fnbLines.length > 0;
    // Real discount-applied total as soon as it's known; instant raw sum
    // (seats + F&B, no discount) as a fallback while the query is in flight —
    // avoids a loading flicker on every step of the order.
    const displayTotal = pricing?.finalAmount ?? estimatedTotal;

    return (
        <div className={`dash-card ${styles.railCard}`}>
            <h2 className={styles.railTitle}>
                Order
                {mode && (
                    <span className={styles.railMode}>
                        {mode === "TICKET_FNB" ? "Tickets + F&B" : "F&B only"}
                    </span>
                )}
            </h2>

            {!hasAnything && <p className={styles.railEmpty}>No items yet.</p>}

            {/* Movie / showtime */}
            {showtime && (
                <div className={styles.railMovie}>
                    {showtime.moviePoster ? (
                        <img className={styles.railPoster} src={showtime.moviePoster} alt={showtime.movieTitle} />
                    ) : (
                        <div className={`${styles.railPoster} ${styles.railPosterPh}`}><FilmIcon size={22} /></div>
                    )}
                    <div>
                        <div className={styles.railMovieTitle}>{showtime.movieTitle}</div>
                        <div className={styles.railMeta}>
                            {showtime.roomName}{showtime.roomType ? ` · ${showtime.roomType}` : ""}
                        </div>
                        <div className={styles.railMeta}>{fmtTime(showtime.startTime)}</div>
                    </div>
                </div>
            )}

            {/* Seats */}
            {selectedSeats.length > 0 && (
                <div>
                    <p className={styles.railSection}>Seats ({selectedSeats.length})</p>
                    <div className={styles.railChips}>
                        {selectedSeats.map((s) => (
                            <span key={s.seatId} className={styles.railChip}>{getSeatLabel(s)}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* F&B */}
            {fnbLines.length > 0 && (
                <div>
                    <p className={styles.railSection}>Food &amp; Beverage</p>
                    {fnbLines.map((l) => (
                        <div key={l.itemId} className={styles.railLine}>
                            <span className={styles.railLineName}>{l.quantity}× {l.name}</span>
                            <span className={styles.railLineVal}>{formatPrice(l.unitPrice * l.quantity)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Customer */}
            {customerResolved && (
                <div>
                    <p className={styles.railSection}>Customer</p>
                    <div className={styles.railLine}>
                        <span className={styles.railLineName}>{member ? member.fullName : "Guest"}</span>
                        {member?.membership && (
                            <span className={styles.railLineVal} style={{ textTransform: "capitalize" }}>
                                {member.membership.currentTier}
                            </span>
                        )}
                    </div>
                    {voucherCode && (
                        <div className={styles.railLine}>
                            <span className={styles.railLineName}>Voucher</span>
                            <span className={styles.railLineVal} style={{ fontFamily: "monospace", fontSize: 12 }}>{voucherCode}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Totals */}
            {hasAnything && (
                <>
                    <div className={styles.railDivider} />
                    {seatsSubtotal > 0 && (
                        <div className={styles.railLine}>
                            <span className={styles.railLineName}>Seats</span>
                            <span className={styles.railLineVal}>{formatPrice(seatsSubtotal)}</span>
                        </div>
                    )}
                    {fnbSubtotal > 0 && (
                        <div className={styles.railLine}>
                            <span className={styles.railLineName}>F&amp;B</span>
                            <span className={styles.railLineVal}>{formatPrice(fnbSubtotal)}</span>
                        </div>
                    )}
                    {pricing && pricing.membershipDiscount > 0 && (
                        <div className={styles.railLine}>
                            <span className={styles.railLineName}>Membership discount</span>
                            <span className={styles.railLineVal} style={{ color: "#147a40" }}>
                                −{formatPrice(pricing.membershipDiscount)}
                            </span>
                        </div>
                    )}
                    {pricing && pricing.voucherDiscount > 0 && (
                        <div className={styles.railLine}>
                            <span className={styles.railLineName}>
                                Voucher{pricing.voucherDetails ? ` · ${pricing.voucherDetails.voucherCode}` : ""}
                            </span>
                            <span className={styles.railLineVal} style={{ color: "#147a40" }}>
                                −{formatPrice(pricing.voucherDiscount)}
                            </span>
                        </div>
                    )}
                    <div className={styles.railDivider} />
                    <div className={styles.railTotal}>
                        <span className={styles.railTotalLabel}>{pricing ? "Total" : "Estimated"}</span>
                        <span className={styles.railTotalVal}>{formatPrice(displayTotal)}</span>
                    </div>
                </>
            )}

            {children && <div className={styles.railActions}>{children}</div>}
        </div>
    );
};

export default OrderRail;
