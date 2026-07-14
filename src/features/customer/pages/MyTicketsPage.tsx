import { type FC, useState } from "react";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useMyBookings } from "@/features/booking/hooks/useMyBookings";
import type { MyBooking } from "@/features/booking/types/ticket.types";
import RefundModal from "@/features/refund/components/RefundModal";

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
const BookingCard: FC<{
    booking: MyBooking;
    onViewDetail: () => void;
    onRefund: () => void;
}> = ({ booking, onViewDetail, onRefund }) => {

    const st = statusStyle(booking.status);

    const showTime = new Date(booking.startTime);
    const now = new Date();

    // còn bao nhiêu mili giây tới giờ chiếu
    const diff = showTime.getTime() - now.getTime();

    // chỉ được refund nếu còn hơn 10 phút
    const before10Minutes = diff > 10 * 60 * 1000;

    // đã refund chưa
    const refunded =
        booking.status.toLowerCase() === "refunded";

    // có được refund không
    const canRefund = before10Minutes && !refunded;

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
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onViewDetail();
            }}
        >
            {booking.movie.posterUrl && (
                <img
                    src={booking.movie.posterUrl}
                    alt={booking.movie.title}
                    style={{
                        width: 64,
                        height: 96,
                        flexShrink: 0,
                        objectFit: "cover",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                    }}
                />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            fontSize: 15.5,
                            fontWeight: 700,
                            color: "#f0e8e8",
                        }}
                    >
                        {booking.movie.title}
                    </div>

                    <span
                        style={{
                            flexShrink: 0,
                            fontSize: 10.5,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding: "3px 12px",
                            borderRadius: 100,
                            background: st.bg,
                            color: st.color,
                        }}
                    >
                        {st.label}
                    </span>
                </div>

                {booking.startTime && (
                    <div
                        style={{
                            fontSize: 12.5,
                            color: "#c8b0b0",
                            marginTop: 6,
                        }}
                    >
                        {fmtDateTime(booking.startTime)}
                    </div>
                )}

                {(booking.cinemaName || booking.roomName) && (
                    <div
                        style={{
                            fontSize: 12.5,
                            color: "#a08888",
                            marginTop: 2,
                        }}
                    >
                        {booking.cinemaName}
                        {booking.cinemaName && booking.roomName ? " · " : ""}
                        {booking.roomName}
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 10,
                    }}
                >
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#f0e8e8",
                        }}
                    >
                        {fmtVnd(booking.finalAmount)}
                    </span>

                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                        }}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetail();
                            }}
                            style={{
                                border: "1px solid rgba(232,0,28,0.4)",
                                background: "rgba(232,0,28,0.08)",
                                color: "#f0a8a8",
                                borderRadius: 8,
                                padding: "6px 14px",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            View Detail
                        </button>

                        <button
                            disabled={!canRefund}
                            onClick={(e) => {
                                e.stopPropagation();

                                if (!canRefund) return;

                                onRefund();
                            }}
                            style={{
                                border: "1px solid rgba(34,197,94,0.4)",

                                background: canRefund
                                    ? "rgba(34,197,94,0.08)"
                                    : "rgba(255,255,255,0.05)",

                                color: canRefund
                                    ? "#4ade80"
                                    : "#777",

                                opacity: canRefund ? 1 : 0.45,

                                cursor: canRefund
                                    ? "pointer"
                                    : "not-allowed",

                                borderRadius: 8,
                                padding: "6px 14px",
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            Refund
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MyTicketsPage: FC = () => {
    const navigate = useNavigate();

    const {
        data: bookings = [],
        isLoading,
        isError,
        refetch,
    } = useMyBookings();

    const [refundOpen, setRefundOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

    const handleRefund = (booking: MyBooking) => {
        setSelectedBookingId(booking.bookingID);
        setRefundOpen(true);
    };

    return (
        <>
            <div>
                <h1
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#f0e8e8",
                        margin: "0 0 6px",
                    }}
                >
                    My Tickets
                </h1>

                <p
                    style={{
                        fontSize: 14,
                        color: "#a08888",
                        margin: "0 0 24px",
                    }}
                >
                    Your booked movies and e-tickets.
                </p>

                {isLoading ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "60px 0",
                        }}
                    >
                        <Spin size="large" />
                    </div>
                ) : isError ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "48px 0",
                            color: "#a08888",
                        }}
                    >
                        <p>Failed to load your tickets.</p>

                        <button
                            onClick={() => refetch()}
                            style={{
                                border: "1px solid rgba(255,255,255,0.16)",
                                background: "rgba(255,255,255,0.05)",
                                color: "#fff",
                                borderRadius: 8,
                                padding: "8px 18px",
                                cursor: "pointer",
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : bookings.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "64px 24px",
                            color: "#a08888",
                        }}
                    >
                        <h3>No bookings yet</h3>

                        <button
                            onClick={() => navigate("/customer")}
                            style={{
                                border: "none",
                                background: "#E8001C",
                                color: "#fff",
                                borderRadius: 8,
                                padding: "10px 22px",
                                cursor: "pointer",
                            }}
                        >
                            Browse Movies
                        </button>
                    </div>
                ) : (
                    <div>
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.bookingID}
                                booking={booking}
                                onViewDetail={() =>
                                    navigate(
                                        `/customer/profile/tickets/${booking.bookingID}`
                                    )
                                }
                                onRefund={() => handleRefund(booking)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <RefundModal
                open={refundOpen}
                bookingId={selectedBookingId}
                onClose={() => {
                    setRefundOpen(false);
                    setSelectedBookingId(null);
                }}
            />
        </>
    );
};

export default MyTicketsPage;