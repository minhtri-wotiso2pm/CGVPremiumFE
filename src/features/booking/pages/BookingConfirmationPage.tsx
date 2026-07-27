import { type FC, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import type { BookingConfirmationNavState, BookingResponse } from "../types/payment.types";
import { formatPrice } from "../utils/seat.utils";
import { formatDateTime } from "@/utils/formatDate";
import { useMyBookings } from "../hooks/useMyBookings";
import TicketQrList from "../components/TicketQrList";
import { FilmClapperIcon } from "@/components/ui/BrandIcons";
import "../components/payment.css";

const TicketIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 000 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 000-4V9z" />
        <line x1="15" y1="7" x2="15" y2="17" strokeDasharray="1.5 2.5" />
    </svg>
);

/** Brand names stay untranslated; only the generic methods resolve via i18n. */
const PAYMENT_LABEL_KEYS: Record<string, string> = {
    wallet: "payment.eWallet",
    cash:   "confirm.cash",
};

const PAYMENT_BRAND_LABELS: Record<string, string> = {
    payos: "PayOS",
    vnpay: "VNPay",
};

/* ══════════════════════════════════════════
   BookingConfirmationPage
══════════════════════════════════════════ */
const BookingConfirmationPage: FC = () => {
    const { t } = useTranslation("booking");
    const navigate  = useNavigate();
    const { state } = useLocation();
    const navState  = (state ?? {}) as BookingConfirmationNavState;
    const [searchParams] = useSearchParams();

    const [copied, setCopied] = useState(false);

    // PayOS redirects the browser straight back to this URL with query
    // params instead of a client-side navigate() — there's no router
    // state in that case, so we fall back to re-fetching the booking by
    // ID (same GET /bookings/my + find-by-ID approach TicketDetailPage
    // already uses) and rebuild the same view the Wallet flow shows.
    const urlBookingId = searchParams.get("bookingId");
    const isPayosReturn = !navState.booking && urlBookingId != null;
    const isPayosPaid = isPayosReturn
        && searchParams.get("status")?.toUpperCase() === "PAID"
        && searchParams.get("cancel") !== "true";

    const { data: myBookings, isLoading: isLoadingBookings } = useMyBookings(isPayosPaid);
    const foundBooking = myBookings?.find((b) => String(b.bookingID) === urlBookingId);

    let booking: BookingResponse | undefined = navState.booking;
    let paymentMethod = navState.paymentMethod;
    let moviePoster = navState.moviePoster;
    const roomType = navState.roomType;

    if (!booking && isPayosPaid && foundBooking) {
        booking = {
            bookingID: foundBooking.bookingID,
            bookingCode: foundBooking.bookingCode,
            showtimeID: foundBooking.showtimeID,
            movieTitle: foundBooking.movie?.title || foundBooking.movieTitle,
            startTime: foundBooking.startTime,
            cinemaName: foundBooking.cinemaName,
            roomName: foundBooking.roomName,
            subTotal: foundBooking.subTotal,
            discountAmount: foundBooking.discountAmount,
            finalAmount: foundBooking.finalAmount,
            status: foundBooking.status,
            bookingDate: foundBooking.bookingDate,
            seats: foundBooking.seats,
            fnbItems: foundBooking.fnbItems,
            voucherApplied: foundBooking.voucherApplied,
        };
        moviePoster = foundBooking.movie?.posterUrl;
        paymentMethod = "payos";
    }

    if (!booking && isPayosPaid && isLoadingBookings) {
        return (
            <div className="cgv-confirm-page" style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!booking) {
        navigate("/customer", { replace: true });
        return null;
    }

    const handleCopyCode = () => {
        navigator.clipboard.writeText(booking.bookingCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const hasFnb = (booking.fnbItems ?? []).length > 0;

    /* ── Render ───────────────────────────── */
    return (
        <div className="cgv-confirm-page">
            <div className="cgv-confirm-inner">

                {/* ── Success header ── */}
                <div className="cgv-confirm-hero">
                    <div className="cgv-confirm-icon" aria-hidden="true">✓</div>
                    <p className="cgv-confirm-title">{t("confirm.title")}</p>
                    <p className="cgv-confirm-subtitle">
                        {t("confirm.subtitle")}
                    </p>

                    {/* Booking code */}
                    <div className="cgv-confirm-code-wrap">
                        <span className="cgv-confirm-code-label">{t("confirm.bookingCode")}</span>
                        <span className="cgv-confirm-code">{booking.bookingCode}</span>
                        <button
                            className={`cgv-confirm-copy-btn${copied ? " cgv-confirm-copy-btn--copied" : ""}`}
                            onClick={handleCopyCode}
                        >
                            {copied ? t("confirm.copied") : t("confirm.copy")}
                        </button>
                    </div>
                </div>

                {/* ── Movie + showtime detail ── */}
                <div className="cgv-confirm-card">

                    {/* Movie */}
                    <div className="cgv-confirm-card__section">
                        <p className="cgv-confirm-card__sec-label">{t("confirm.movieDetails")}</p>
                        <div className="cgv-confirm-movie-row">
                            {moviePoster ? (
                                <img
                                    src={moviePoster}
                                    alt={booking.movieTitle}
                                    className="cgv-confirm-poster"
                                />
                            ) : (
                                <div className="cgv-confirm-poster-ph"><FilmClapperIcon size={26} /></div>
                            )}
                            <div className="cgv-confirm-movie-info">
                                <p className="cgv-confirm-movie-title">{booking.movieTitle}</p>
                                <p className="cgv-confirm-movie-meta">
                                    {booking.cinemaName}
                                    {booking.roomName ? ` · ${booking.roomName}` : ""}
                                    {roomType ? ` (${roomType})` : ""}
                                </p>
                                <p className="cgv-confirm-movie-meta">
                                    {formatDateTime(booking.startTime)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Seats */}
                    {(booking.seats ?? []).length > 0 && (
                        <div className="cgv-confirm-card__section">
                            <p className="cgv-confirm-card__sec-label">{t("ticketDetail.seats")}</p>
                            <div className="cgv-confirm-chips">
                                {booking.seats.map((s) => (
                                    <span key={s.seatID} className="cgv-confirm-chip">
                                        {s.seatRow}{String(s.seatCol).padStart(2, "0")}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* F&B */}
                    {hasFnb && (
                        <div className="cgv-confirm-card__section">
                            <p className="cgv-confirm-card__sec-label">{t("fnb.foodBeverage")}</p>
                            {booking.fnbItems.map((item) => (
                                <div key={item.itemName} className="cgv-confirm-row">
                                    <span className="cgv-confirm-row__label">
                                        {item.quantity}× {item.itemName}
                                    </span>
                                    <span className="cgv-confirm-row__val">
                                        {formatPrice(item.subTotal)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Payment summary */}
                    <div className="cgv-confirm-card__section">
                        <p className="cgv-confirm-card__sec-label">{t("fnb.stepPayment")}</p>
                        <div className="cgv-confirm-row">
                            <span className="cgv-confirm-row__label">{t("confirm.method")}</span>
                            <span className="cgv-confirm-row__val">
                                {PAYMENT_BRAND_LABELS[paymentMethod]
                                    ?? (PAYMENT_LABEL_KEYS[paymentMethod] ? t(PAYMENT_LABEL_KEYS[paymentMethod]) : paymentMethod)}
                            </span>
                        </div>
                        {booking.discountAmount > 0 && (
                            <div className="cgv-confirm-row">
                                <span className="cgv-confirm-row__label">{t("ticketDetail.discount")}</span>
                                <span
                                    className="cgv-confirm-row__val"
                                    style={{ color: "#4caf50" }}
                                >
                                    −{formatPrice(booking.discountAmount)}
                                </span>
                            </div>
                        )}
                        {booking.voucherApplied && (
                            <div className="cgv-confirm-row">
                                <span className="cgv-confirm-row__label">{t("payment.voucher")}</span>
                                <span className="cgv-confirm-row__val">
                                    {booking.voucherApplied.voucherCode}
                                    {booking.voucherApplied.discountApplied > 0 && (
                                        <span style={{ color: "#4caf50" }}>
                                            {" "}(−{formatPrice(booking.voucherApplied.discountApplied)})
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                        <div className="cgv-confirm-card__section" style={{ padding: "0", border: "none" }}>
                            <div className="cgv-confirm-row cgv-confirm-row--total" style={{ marginTop: 10 }}>
                                <span className="cgv-confirm-row__label">{t("ticketDetail.totalPaid")}</span>
                                <span className="cgv-confirm-row__val">
                                    {formatPrice(booking.finalAmount)}
                                </span>
                            </div>
                        </div>
                        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "rgba(240,232,232,0.45)" }}>
                            {t("confirm.pointsNote")}
                        </p>
                    </div>

                    {/* Booking date */}
                    <div className="cgv-confirm-card__section">
                        <p className="cgv-confirm-card__sec-label">{t("confirm.bookingTime")}</p>
                        <p style={{ fontSize: 13, color: "rgba(240,232,232,0.6)" }}>
                            {formatDateTime(booking.bookingDate)}
                        </p>
                    </div>
                </div>

                {/* ── E-Tickets (QR) ── */}
                <div className="cgv-confirm-card" style={{ marginTop: 16 }}>
                    <div className="cgv-confirm-card__section" style={{ borderBottom: "none" }}>
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

                {/* ── Actions ── */}
                <div className="cgv-confirm-actions">
                    <button
                        className="cgv-confirm-invoice-btn"
                        onClick={() => navigate(`/customer/profile/tickets/${booking.bookingID}`)}
                    >
                        <TicketIcon />
                        {t("confirm.myTicket")}
                    </button>
                    <button
                        className="cgv-confirm-home-btn"
                        onClick={() => navigate("/customer", { replace: true })}
                    >
                        {t("confirm.backToHome")}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BookingConfirmationPage;
