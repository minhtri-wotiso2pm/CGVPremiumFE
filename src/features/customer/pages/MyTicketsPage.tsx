import { type FC } from "react";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useMyBookings } from "@/features/booking/hooks/useMyBookings";
import type { MyBooking } from "@/features/booking/types/ticket.types";

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
    if (s === "paid") return { bg: "rgba(34,197,94,0.14)", color: "#4ade80", label: "Paid" };
    if (s === "pending") return { bg: "rgba(245,158,11,0.14)", color: "#fbbf24", label: "Pending" };
    if (s === "cancelled") return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", label: "Cancelled" };
    if (s === "expired") return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", label: "Expired" };
    return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", label: status };
};

/** Simplified list card: poster + the essentials only. Full ticket/QR and
 *  price breakdown now live on the dedicated detail page (one click away)
 *  instead of expanding inline here. */
const BookingCard: FC<{ booking: MyBooking; onViewDetail: () => void }> = ({ booking, onViewDetail }) => {
    const st = statusStyle(booking.status);

    return (
        <div
            style={{
                display: "flex",
                gap: 16,
                background: "rgba(20,6,6,0.92)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: 16,
                marginBottom: 14,
                cursor: "pointer",
            }}
            onClick={onViewDetail}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onViewDetail(); }}
        >
            {booking.movie.posterUrl && (
                <img
                    src={booking.movie.posterUrl}
                    alt={booking.movie.title}
                    style={{ width: 64, height: 96, flexShrink: 0, objectFit: "cover", borderRadius: 8, background: "rgba(255,255,255,0.05)" }}
                />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: "#f0e8e8" }}>{booking.movie.title}</div>
                    <span style={{
                        flexShrink: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "3px 12px", borderRadius: 100, background: st.bg, color: st.color,
                    }}>
                        {st.label}
                    </span>
                </div>

                {booking.startTime && (
                    <div style={{ fontSize: 12.5, color: "#c8b0b0", marginTop: 6 }}>
                        {fmtDateTime(booking.startTime)}
                    </div>
                )}
                {(booking.cinemaName || booking.roomName) && (
                    <div style={{ fontSize: 12.5, color: "#a08888", marginTop: 2 }}>
                        {booking.cinemaName}{booking.cinemaName && booking.roomName ? " · " : ""}{booking.roomName}
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#f0e8e8" }}>{fmtVnd(booking.finalAmount)}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
                        style={{
                            border: "1px solid rgba(232,0,28,0.4)", background: "rgba(232,0,28,0.08)",
                            color: "#f0a8a8", borderRadius: 8, padding: "6px 14px", fontSize: 12,
                            fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        View Detail
                    </button>
                </div>
            </div>
        </div>
    );
};

const MyTicketsPage: FC = () => {
    const navigate = useNavigate();
    const { data: bookings = [], isLoading, isError, refetch } = useMyBookings();

    return (
        <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0e8e8", margin: "0 0 6px" }}>My Tickets</h1>
            <p style={{ fontSize: 14, color: "#a08888", margin: "0 0 24px" }}>
                Your booked movies and e-tickets. Show the QR code at the cinema entrance.
            </p>

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spin size="large" /></div>
            ) : isError ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#a08888" }}>
                    <p style={{ margin: "0 0 12px" }}>Failed to load your tickets.</p>
                    <button onClick={() => refetch()} style={{ border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.05)", color: "#f0e8e8", borderRadius: 8, padding: "7px 16px", cursor: "pointer" }}>
                        Retry
                    </button>
                </div>
            ) : bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 24px", color: "#a08888" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 16, color: "#f0e8e8" }}>No bookings yet</p>
                    <p style={{ margin: "0 0 18px", fontSize: 14 }}>Book your first movie to see tickets here.</p>
                    <button
                        onClick={() => navigate("/customer")}
                        style={{ border: "none", background: "linear-gradient(135deg,#E8001C,#b50016)", color: "#fff", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                        Browse Movies
                    </button>
                </div>
            ) : (
                <div>
                    {bookings.map((b) => (
                        <BookingCard
                            key={b.bookingID}
                            booking={b}
                            onViewDetail={() => navigate(`/customer/profile/tickets/${b.bookingID}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTicketsPage;
