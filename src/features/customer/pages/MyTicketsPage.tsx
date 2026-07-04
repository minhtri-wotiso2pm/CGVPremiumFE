import { type FC, useState } from "react";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useMyBookings } from "@/features/booking/hooks/useMyBookings";
import TicketQrList from "@/features/booking/components/TicketQrList";
import type { MyBooking } from "@/features/booking/types/ticket.types";

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const statusStyle = (status: string): { bg: string; color: string; label: string } => {
    const s = status.toLowerCase();
    if (s === "paid") return { bg: "rgba(34,197,94,0.14)", color: "#4ade80", label: "Paid" };
    if (s === "pending") return { bg: "rgba(245,158,11,0.14)", color: "#fbbf24", label: "Pending" };
    if (s === "cancelled") return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", label: "Cancelled" };
    return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", label: status };
};

const BookingCard: FC<{ booking: MyBooking }> = ({ booking }) => {
    const [open, setOpen] = useState(false);
    const st = statusStyle(booking.status);
    const seatLabels = (booking.seats ?? []).map((s) => `${s.seatRow}${String(s.seatCol).padStart(2, "0")}`);

    return (
        <div style={{
            background: "rgba(20,6,6,0.92)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "18px 20px",
            marginBottom: 14,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#f0e8e8", marginBottom: 4 }}>{booking.movieTitle}</div>
                    <div style={{ fontSize: 12.5, color: "#a08888" }}>
                        Code: <span style={{ color: "#c8b0b0", letterSpacing: "0.04em" }}>{booking.bookingCode}</span>
                    </div>
                    {seatLabels.length > 0 && (
                        <div style={{ fontSize: 12.5, color: "#a08888", marginTop: 3 }}>
                            Seats: <span style={{ color: "#c8b0b0" }}>{seatLabels.join(", ")}</span>
                        </div>
                    )}
                </div>
                <div style={{ textAlign: "right" }}>
                    <span style={{
                        fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "3px 12px", borderRadius: 100, background: st.bg, color: st.color,
                    }}>
                        {st.label}
                    </span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f0e8e8", marginTop: 8 }}>{fmtVnd(booking.finalAmount)}</div>
                </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                <button
                    onClick={() => setOpen((v) => !v)}
                    style={{
                        border: "1px solid rgba(232,0,28,0.4)", background: "rgba(232,0,28,0.08)",
                        color: "#f0a8a8", borderRadius: 8, padding: "7px 16px", fontSize: 12.5,
                        fontWeight: 600, cursor: "pointer",
                    }}
                >
                    {open ? "Hide tickets" : "View tickets"}
                </button>
            </div>

            {open && (
                <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
                    <TicketQrList
                        bookingId={booking.bookingID}
                        seats={booking.seats}
                        movieTitle={booking.movieTitle}
                        bookingCode={booking.bookingCode}
                    />
                </div>
            )}
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
                    {bookings.map((b) => <BookingCard key={b.bookingID} booking={b} />)}
                </div>
            )}
        </div>
    );
};

export default MyTicketsPage;
