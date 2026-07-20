import { type FC, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin } from "antd";
import { useMyBookings } from "@/features/booking/hooks/useMyBookings";
import TicketQrList from "@/features/booking/components/TicketQrList";
import BookingBarcode from "@/features/booking/components/BookingBarcode";
import type { PrintableBooking } from "@/features/booking/utils/printBooking";
import RefundModal, { type RefundBookingInfo } from "@/features/booking/components/RefundModal";
import ReviewModal from "@/features/reviews/components/ReviewModal";
import { canWriteReview } from "@/features/reviews/utils/reviewFormat";
import { canRequestRefund, hasRefundQuotaLeft } from "@/features/booking/utils/refund.utils";
import { isFnbOnlyBooking } from "@/features/booking/utils/booking.utils";
import { useProfile } from "@/features/customer/hooks/useProfile";
import { FnbBagIcon, CheckCircleIcon } from "@/components/ui/BrandIcons";
import "./ticketDetail.css";

const ReviewStarIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" aria-hidden="true">
        <path d="M12 2L14.35 8.76L21.51 8.91L15.8 13.24L17.88 20.09L12 16L6.12 20.09L8.2 13.24L2.49 8.91L9.65 8.76Z" />
    </svg>
);

const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;
const fmtPoints = (n: number) => n.toLocaleString("en-US");

const fmtDateTime = (iso: string): string => {
    try {
        const d = new Date(iso);
        const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
        const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        return `${time}, ${date}`;
    } catch { return ""; }
};

const statusStyle = (status: string): { bg: string; color: string; label: string } => {
    const s = status.toLowerCase();
    if (s === "paid") return { bg: "rgba(232,0,28,0.9)", color: "#fff", label: "Paid" };
    if (s === "used") return { bg: "rgba(167,139,250,0.9)", color: "#fff", label: "Attended" };
    if (s === "pending") return { bg: "rgba(245,158,11,0.9)", color: "#fff", label: "Pending" };
    if (s === "cancelled") return { bg: "rgba(148,163,184,0.5)", color: "#fff", label: "Cancelled" };
    if (s === "expired") return { bg: "rgba(148,163,184,0.5)", color: "#fff", label: "Expired" };
    if (s === "refunded") return { bg: "rgba(96,165,250,0.85)", color: "#fff", label: "Refunded" };
    return { bg: "rgba(148,163,184,0.5)", color: "#fff", label: status };
};

/** Standalone, full-screen ticket detail — a dedicated route (not nested
 *  inside the profile sidebar layout) so it reads as a focused "your
 *  ticket" view rather than another settings-style sub-page. */
const TicketDetailPage: FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const { data: bookings = [], isLoading, isError } = useMyBookings();
    const { data: profile } = useProfile();
    const booking = bookings.find((b) => String(b.bookingID) === bookingId);
    const [refundTarget, setRefundTarget] = useState<RefundBookingInfo | null>(null);
    const [reviewOpen, setReviewOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="tktd-page" style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (isError || !booking) {
        return (
            <div className="tktd-page" style={{ textAlign: "center", padding: "80px 24px" }}>
                <p style={{ color: "#f0e8e8", fontSize: 16, margin: "0 0 12px" }}>Couldn't find this ticket.</p>
                <button className="tktd-back-link" onClick={() => navigate("/customer/profile/tickets")}>
                    Back to My Tickets
                </button>
            </div>
        );
    }

    const fnbOnly = isFnbOnlyBooking(booking);
    const st = statusStyle(booking.status);
    const printable: PrintableBooking = {
        bookingCode: booking.bookingCode,
        movieTitle: booking.movie.title,
        startTime: booking.startTime,
        cinemaName: booking.cinemaName,
        roomName: booking.roomName,
        seats: booking.seats.map((s) => ({ label: `${s.seatRow}${s.seatCol}`, price: s.ticketPrice })),
        fnbItems: booking.fnbItems.map((f) => ({ name: f.itemName, quantity: f.quantity, subTotal: f.subTotal })),
        subTotal: booking.subTotal,
        discountAmount: booking.discountAmount,
        finalAmount: booking.finalAmount,
    };
    const refundsRemaining = profile ? profile.total_refunds - profile.used_refunds : null;
    const quotaOk = hasRefundQuotaLeft(refundsRemaining);
    const timeAndStatusOk = canRequestRefund(booking.status, booking.startTime);
    const refundEligible = timeAndStatusOk && quotaOk;
    const quotaExhausted = timeAndStatusOk && !quotaOk;
    const reviewEligible = !fnbOnly && canWriteReview(booking);
    const reviewed = !fnbOnly && booking.hasReviewed;

    return (
        <div className="tktd-page">
            <div className="tktd-header">
                <button className="tktd-back" onClick={() => navigate(-1)} aria-label="Go back">
                    <BackIcon />
                </button>
                <h1 className="tktd-title">{fnbOnly ? "F&B Order" : "E-Ticket"}</h1>
                <span className="tktd-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                {refundEligible && (
                    <button
                        onClick={() =>
                            setRefundTarget({
                                bookingID: booking.bookingID,
                                bookingCode: booking.bookingCode,
                                movieTitle: booking.movie.title,
                                finalAmount: booking.finalAmount,
                            })
                        }
                        style={{
                            marginLeft: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)",
                            color: "#c8b0b0", borderRadius: 8, padding: "6px 14px", fontSize: 12.5,
                            fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        Request Refund
                    </button>
                )}
                {quotaExhausted && (
                    <span
                        title="You've used all your refund credits for this month. Your quota resets at the start of next month."
                        style={{
                            marginLeft: 10, border: "1px solid rgba(232,0,28,0.25)", background: "rgba(232,0,28,0.06)",
                            color: "#e8a0a0", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 600,
                        }}
                    >
                        Refund limit reached
                    </span>
                )}
                {reviewEligible && (
                    <button
                        onClick={() => setReviewOpen(true)}
                        style={{
                            marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 6,
                            border: "1px solid rgba(245,179,1,0.4)", background: "rgba(245,179,1,0.08)",
                            color: "#f5c451", borderRadius: 8, padding: "6px 14px", fontSize: 12.5,
                            fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        <ReviewStarIcon /> Write a Review
                        {booking.reviewReward && booking.reviewReward.points > 0
                            ? ` · +${fmtPoints(booking.reviewReward.points)} pts`
                            : ""}
                    </button>
                )}
                {reviewed && (
                    <span
                        style={{
                            marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 6,
                            border: "1px solid rgba(34,197,94,0.28)", background: "rgba(34,197,94,0.08)",
                            color: "#4ade80", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 600,
                        }}
                    >
                        <ReviewStarIcon /> Reviewed
                    </span>
                )}
            </div>

            <div className="tktd-body">
                <div className="tktd-movie-col">
                    {fnbOnly ? (
                        <div className="tktd-movie">
                            <div className="tktd-fnb-badge"><FnbBagIcon size={34} /></div>
                            <div className="tktd-movie-info">
                                <h2 className="tktd-movie-title">Food &amp; Beverage Order</h2>
                                <p className="tktd-cinema">
                                    {booking.cinemaName ? `${booking.cinemaName} · ` : ""}Collect at the F&amp;B counter
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="tktd-movie">
                            {booking.movie.posterUrl && (
                                <img src={booking.movie.posterUrl} alt={booking.movie.title} className="tktd-poster" />
                            )}
                            <div className="tktd-movie-info">
                                <h2 className="tktd-movie-title">{booking.movie.title}</h2>
                                <div className="tktd-movie-meta">
                                    {booking.movie.ageRating && <span className="tktd-age-badge">{booking.movie.ageRating}</span>}
                                    {booking.movie.durationMinutes > 0 && <span>{booking.movie.durationMinutes} min</span>}
                                </div>
                                <p className="tktd-showtime">{fmtDateTime(booking.startTime)}</p>
                                <p className="tktd-cinema">{booking.cinemaName} · {booking.roomName}</p>
                            </div>
                        </div>
                    )}

                    <div className="tktd-summary">
                        <h3 className="tktd-summary__title">Booking Summary</h3>

                        <div style={{ margin: "0 0 14px" }}>
                            <BookingBarcode
                                code={booking.bookingCode}
                                printable={printable}
                                variant="dark"
                                note="Scan at the F&B counter to pick up your order"
                            />
                        </div>
                        <div className="tktd-summary__row tktd-summary__row--muted">
                            <span>Booking Date</span>
                            <span>{fmtDateTime(booking.bookingDate)}</span>
                        </div>

                        {booking.seats.length > 0 && (
                            <div className="tktd-summary__group">
                                <p className="tktd-summary__group-label">Seats</p>
                                {booking.seats.map((s) => (
                                    <div className="tktd-summary__row" key={s.seatID}>
                                        <span>Seat {s.seatRow}{s.seatCol}</span>
                                        <span>{fmtVnd(s.ticketPrice)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {booking.fnbItems.length > 0 && (
                            <div className="tktd-summary__group">
                                <p className="tktd-summary__group-label">Food &amp; Beverage</p>
                                {booking.fnbItems.map((f, i) => (
                                    <div className="tktd-summary__row" key={i}>
                                        <span>{f.itemName} × {f.quantity}</span>
                                        <span>{fmtVnd(f.subTotal)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="tktd-summary__group">
                            <div className="tktd-summary__row">
                                <span>Subtotal</span>
                                <span>{fmtVnd(booking.subTotal)}</span>
                            </div>
                            {booking.voucherApplied && (
                                <div className="tktd-summary__row">
                                    <span>
                                        Voucher <span className="tktd-summary__voucher-code">{booking.voucherApplied.voucherCode}</span>
                                    </span>
                                    <span className="tktd-summary__discount">−{fmtVnd(booking.voucherApplied.discountApplied)}</span>
                                </div>
                            )}
                            {!booking.voucherApplied && booking.discountAmount > 0 && (
                                <div className="tktd-summary__row">
                                    <span>Discount</span>
                                    <span className="tktd-summary__discount">−{fmtVnd(booking.discountAmount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="tktd-summary__row tktd-summary__row--total">
                            <span>Total Paid</span>
                            <span>{fmtVnd(booking.finalAmount)}</span>
                        </div>

                        {booking.purchaseReward && booking.purchaseReward.points > 0 && (
                            <div className="tktd-summary__row tktd-summary__row--muted">
                                <span>Loyalty Points</span>
                                {booking.purchaseReward.earned ? (
                                    <span className="tktd-summary__discount" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                        <CheckCircleIcon size={13} /> +{fmtPoints(booking.purchaseReward.points)} earned
                                    </span>
                                ) : (
                                    <span>+{fmtPoints(booking.purchaseReward.points)} after check-in</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="tktd-tickets-col">
                    {fnbOnly ? (
                        <div className="tktd-fnb-collect">
                            <div className="tktd-fnb-collect__icon"><FnbBagIcon size={40} /></div>
                            <h3 className="tktd-fnb-collect__title">Collect your order</h3>
                            <p className="tktd-fnb-collect__body">
                                This is a food &amp; beverage order with no seats. Show the booking barcode
                                to the staff at the F&amp;B counter to collect your items.
                            </p>
                        </div>
                    ) : (
                        <TicketQrList
                            bookingId={booking.bookingID}
                            seats={booking.seats}
                            cinemaName={booking.cinemaName}
                            roomName={booking.roomName}
                            startTime={booking.startTime}
                            bookingCode={booking.bookingCode}
                        />
                    )}
                </div>
            </div>

            <RefundModal open={refundTarget != null} booking={refundTarget} onClose={() => setRefundTarget(null)} />
            <ReviewModal
                open={reviewOpen}
                booking={reviewOpen ? {
                    bookingID: booking.bookingID,
                    movieTitle: booking.movie.title,
                    posterUrl: booking.movie.posterUrl,
                    subtitle: fmtDateTime(booking.startTime),
                } : null}
                onClose={() => setReviewOpen(false)}
            />
        </div>
    );
};

export default TicketDetailPage;
