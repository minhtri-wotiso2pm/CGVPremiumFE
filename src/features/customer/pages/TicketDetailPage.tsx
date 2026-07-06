import { type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin } from "antd";
import { useMyBookings } from "@/features/booking/hooks/useMyBookings";
import TicketQrList from "@/features/booking/components/TicketQrList";
import "./ticketDetail.css";

const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

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
    if (s === "pending") return { bg: "rgba(245,158,11,0.9)", color: "#fff", label: "Pending" };
    if (s === "cancelled") return { bg: "rgba(148,163,184,0.5)", color: "#fff", label: "Cancelled" };
    if (s === "expired") return { bg: "rgba(148,163,184,0.5)", color: "#fff", label: "Expired" };
    return { bg: "rgba(148,163,184,0.5)", color: "#fff", label: status };
};

/** Standalone, full-screen ticket detail — a dedicated route (not nested
 *  inside the profile sidebar layout) so it reads as a focused "your
 *  ticket" view rather than another settings-style sub-page. */
const TicketDetailPage: FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const { data: bookings = [], isLoading, isError } = useMyBookings();
    const booking = bookings.find((b) => String(b.bookingID) === bookingId);

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

    const st = statusStyle(booking.status);

    return (
        <div className="tktd-page">
            <div className="tktd-header">
                <button className="tktd-back" onClick={() => navigate(-1)} aria-label="Go back">
                    <BackIcon />
                </button>
                <h1 className="tktd-title">E-Ticket</h1>
                <span className="tktd-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
            </div>

            <div className="tktd-body">
                <div className="tktd-movie-col">
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

                    <div className="tktd-summary">
                        <h3 className="tktd-summary__title">Booking Summary</h3>

                        <div className="tktd-summary__row tktd-summary__row--muted">
                            <span>Booking Code</span>
                            <span>{booking.bookingCode}</span>
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
                    </div>
                </div>

                <div className="tktd-tickets-col">
                    <TicketQrList
                        bookingId={booking.bookingID}
                        seats={booking.seats}
                        cinemaName={booking.cinemaName}
                        roomName={booking.roomName}
                        startTime={booking.startTime}
                        bookingCode={booking.bookingCode}
                    />
                </div>
            </div>
        </div>
    );
};

export default TicketDetailPage;
