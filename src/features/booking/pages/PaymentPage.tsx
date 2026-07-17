import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "@/store/hooks";
import type { PaymentNavState } from "../types/fnb.types";
import type {
    BookingResponse,
    PaymentInitiateResponse,
    PricingResponse,
    VoucherApplyStatus,
} from "../types/payment.types";
import { useCalculatePricing } from "../hooks/useCalculatePricing";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { useInitiatePayment } from "../hooks/useInitiatePayment";
import { useWallet } from "../hooks/useWallet";
import { getPaymentStatusApi } from "@/services/api/payment.service";
import { formatPrice, getSeatLabel } from "../utils/seat.utils";
import { clearActiveSeatHold } from "../utils/activeSeatHold";
import type { BookingConfirmationNavState } from "../types/payment.types";
import VoucherPickerModal from "../components/VoucherPickerModal";
import "../components/payment.css";

/* ── Helpers ──────────────────────────────── */
const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

function formatCountdown(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
    try {
        return new Date(iso).toLocaleString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

/* ══════════════════════════════════════════
   PaymentPage
══════════════════════════════════════════ */
const PaymentPage: FC = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const navState = (state ?? {}) as PaymentNavState;
    const customerId = useAppSelector((s) => s.auth.user?.userID) ?? null;

    const {
        showtimeId,
        seatIds,
        selectedSeats,
        holdExpiresAt,
        fnbItems,
        movieTitle,
        moviePoster,
        startTime,
        cinemaName,
        roomName,
        roomType,
    } = navState;

    /* ── Guard ─────────────────────────────── */
    useEffect(() => {
        if (!showtimeId) navigate("/customer", { replace: true });
    }, [showtimeId, navigate]);

    /* ── Countdown timer ──────────────────── */
    const [timeLeft, setTimeLeft] = useState<number>(() =>
        holdExpiresAt ? Math.max(0, new Date(holdExpiresAt).getTime() - Date.now()) : 0,
    );

    useEffect(() => {
        if (!holdExpiresAt) return;
        const id = setInterval(() => {
            setTimeLeft(Math.max(0, new Date(holdExpiresAt).getTime() - Date.now()));
        }, 1_000);
        return () => clearInterval(id);
    }, [holdExpiresAt]);

    const isExpired = holdExpiresAt ? timeLeft === 0 : false;
    const isUrgent = timeLeft > 0 && timeLeft < 2 * 60_000;

    /* ── Payment method ───────────────────── */
    const [paymentMethod, setPaymentMethod] = useState<"payos" | "wallet">("payos");

    /* ── Voucher ──────────────────────────── */
    const [voucherInput, setVoucherInput] = useState("");
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [voucherStatus, setVoucherStatus] = useState<VoucherApplyStatus>("idle");
    const [voucherError, setVoucherError] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);

    /* ── Pricing ──────────────────────────── */
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [isPricingLoading, setIsPricingLoading] = useState(true);
    const [pricingError, setPricingError] = useState<string | null>(null);

    /* ── Payment state ────────────────────── */
    const [isWaiting, setIsWaiting] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    /* ── Refs for polling ─────────────────── */
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const bookingRef = useRef<BookingResponse | null>(null);
    const paymentInitRef = useRef<PaymentInitiateResponse | null>(null);

    /* ── Hooks ────────────────────────────── */
    const { mutateAsync: calcPricing } = useCalculatePricing();
    const { mutateAsync: doCreateBooking } = useCreateBooking();
    const { mutateAsync: doInitiatePayment } = useInitiatePayment();
    const { data: walletData } = useWallet();

    /* ── Calculate pricing ────────────────── */
    // Full-card path: real loads (mount, remove-voucher) where a failure
    // genuinely means "we have no pricing to show" — owns the skeleton and
    // the big card-level error.
    const fetchBasePricing = useCallback(
        async () => {
            if (!showtimeId) return;
            setIsPricingLoading(true);
            setPricingError(null);
            try {
                const result = await calcPricing({
                    customerId,
                    showtimeId,
                    seatIds: seatIds ?? [],
                    fnbItems: fnbItems ?? [],
                    voucherCode: null,
                });
                setPricing(result);
            } catch {
                setPricingError("Couldn't load pricing information. Please try again.");
            } finally {
                setIsPricingLoading(false);
            }
        },
        [calcPricing, showtimeId, seatIds, fnbItems, customerId],
    );

    useEffect(() => {
        fetchBasePricing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Narrow path: applying/re-applying a voucher. A bad code only ever shows
    // an inline error next to the input — it never touches the already-shown
    // price breakdown, and `appliedCode` (the value sent to createBooking)
    // only ever gets set here, on confirmed success — never optimistically.
    const applyVoucherCode = useCallback(
        async (code: string) => {
            if (!showtimeId) return;
            setVoucherStatus("applying");
            setVoucherError(null);
            try {
                const result = await calcPricing({
                    customerId,
                    showtimeId,
                    seatIds: seatIds ?? [],
                    fnbItems: fnbItems ?? [],
                    voucherCode: code,
                });
                setPricing(result);
                setAppliedCode(code);
                setVoucherStatus("applied");
            } catch (err: unknown) {
                const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
                setVoucherError(msg ?? "This voucher code isn't valid for this order.");
                setVoucherStatus("error");
            }
        },
        [calcPricing, showtimeId, seatIds, fnbItems, customerId],
    );

    /* ── Voucher handlers ─────────────────── */
    const handleApplyVoucher = useCallback(() => {
        const code = voucherInput.trim().toUpperCase();
        if (!code) return;
        applyVoucherCode(code);
    }, [voucherInput, applyVoucherCode]);

    const handlePickVoucher = useCallback((code: string) => {
        setVoucherInput(code);
        applyVoucherCode(code);
    }, [applyVoucherCode]);

    const handleRemoveVoucher = useCallback(() => {
        setAppliedCode(null);
        setVoucherInput("");
        setVoucherStatus("idle");
        setVoucherError(null);
        fetchBasePricing();
    }, [fetchBasePricing]);

    /* ── Polling ──────────────────────────── */
    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    useEffect(() => () => stopPolling(), [stopPolling]);

    const startPolling = useCallback(
        (paymentId: number) => {
            let count = 0;
            pollIntervalRef.current = setInterval(async () => {
                count += 1;
                if (count > 200) {
                    stopPolling();
                    setPaymentError("Your payment session has expired. Please try again.");
                    setIsWaiting(false);
                    return;
                }
                try {
                    const statusData = await getPaymentStatusApi(paymentId);
                    const s = statusData.status?.toUpperCase();
                    if (s === "SUCCESS") {
                        stopPolling();
                        const confirmState: BookingConfirmationNavState = {
                            booking: bookingRef.current!,
                            paymentId,
                            paymentMethod: paymentInitRef.current?.paymentMethod ?? "",
                            moviePoster,
                            roomType,
                        };
                        navigate("/customer/booking/confirmation", {
                            state: confirmState,
                            replace: true,
                        });
                    } else if (s === "FAILED" || s === "EXPIRED" || s === "CANCELLED") {
                        stopPolling();
                        setPaymentError(
                            "Payment failed or was cancelled. Please try again.",
                        );
                        setIsWaiting(false);
                    }
                } catch {
                    /* network hiccup — keep polling */
                }
            }, 3_000);
        },
        [stopPolling, navigate, moviePoster, roomType],
    );

    /* ── Back to F&B ───────────────────────── */
    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    /* ── Derived ──────────────────────────── */
    const walletBalance = walletData?.balance ?? 0;
    const finalAmount = pricing?.finalAmount ?? 0;
    // A fully-discounted (voucher/membership) order has nothing to charge —
    // there's no PayOS transaction to run, so wallet is the only valid
    // method and it isn't a user choice.
    const isFreeOrder = !!pricing && finalAmount === 0;
    const effectivePaymentMethod = isFreeOrder ? "wallet" : paymentMethod;
    const walletInsufficient = effectivePaymentMethod === "wallet" && walletBalance < finalAmount;
    const canPay = !!pricing && !isExpired && !walletInsufficient && !isWaiting;

    /* ── Pay handler ──────────────────────── */
    const handlePay = useCallback(async () => {
        if (!pricing || isExpired) return;
        setPaymentError(null);
        setIsWaiting(true);
        try {
            const booking = await doCreateBooking({
                customerId,
                showtimeId,
                seatIds: seatIds ?? [],
                fnbItems: fnbItems ?? [],
                voucherCode: appliedCode,
            });
            bookingRef.current = booking;
            // Seats are now booked, not just held — stop tracking this
            // hold so a later browser Back to Seat Selection can't
            // trigger a stale release for already-booked seats.
            clearActiveSeatHold();

            const paymentInit = await doInitiatePayment({
                bookingId: booking.bookingID,
                paymentMethod: effectivePaymentMethod,
            });
            paymentInitRef.current = paymentInit;

            if (effectivePaymentMethod === "payos" && paymentInit.checkoutUrl) {
                // Full-page redirect (not a new tab) — PayOS's configured
                // returnUrl/cancelUrl bring the browser straight back into
                // this same tab, so there's no separate tab left polling.
                window.location.href = paymentInit.checkoutUrl;
                return;
            }

            startPolling(paymentInit.paymentId);
        } catch (err: unknown) {
            setIsWaiting(false);
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setPaymentError(msg ?? "Something went wrong. Please try again.");
        }
    }, [
        pricing, isExpired, doCreateBooking, doInitiatePayment, customerId,
        showtimeId, seatIds, fnbItems, appliedCode, effectivePaymentMethod, startPolling,
    ]);

    const seatCount = (seatIds ?? []).length;
    const hasFnb = (fnbItems ?? []).length > 0;
    const fnbDetails = pricing?.fnBDetails ?? [];

    if (!showtimeId) return null;

    /* ── Render ───────────────────────────── */
    return (
        <div className="cgv-pay-page">
            <div className="cgv-pay-container">

                {/* ── Step indicator ── */}
                <div className="cgv-pay-steps">
                    <button className="cgv-pay-back-btn" onClick={handleBack} aria-label="Back to food & beverage">
                        <BackIcon />
                    </button>
                    <div className="cgv-pay-step cgv-pay-step--done">
                        <span className="cgv-pay-step__num">✓</span>
                        Select Seats
                    </div>
                    <div className="cgv-pay-step__sep" />
                    <div className="cgv-pay-step cgv-pay-step--done">
                        <span className="cgv-pay-step__num">✓</span>
                        Food &amp; Beverage
                    </div>
                    <div className="cgv-pay-step__sep" />
                    <div className="cgv-pay-step cgv-pay-step--active">
                        <span className="cgv-pay-step__num">3</span>
                        Payment
                    </div>
                </div>

                {/* ── Countdown timer ── */}
                {holdExpiresAt && (
                    <div
                        className={`cgv-pay-timer${isUrgent ? " cgv-pay-timer--urgent" : ""}${isExpired ? " cgv-pay-timer--expired" : ""}`}
                    >
                        <span className="cgv-pay-timer__icon">⏱</span>
                        {isExpired ? (
                            <span style={{ color: "#ff6b6b", fontWeight: 600 }}>
                                Your seat hold has expired — please go back and select seats again
                            </span>
                        ) : (
                            <>
                                <span>Your seats are held for</span>
                                <span className="cgv-pay-timer__count">
                                    {formatCountdown(timeLeft)}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* ── Main 2-col layout ── */}
                <div className="cgv-pay-layout">

                    {/* ── Left: order review ── */}
                    <div className="cgv-pay-left">
                        <div className="cgv-pay-review">

                            {/* Movie info */}
                            <div className="cgv-pay-review__movie">
                                {moviePoster ? (
                                    <img
                                        src={moviePoster}
                                        alt={movieTitle}
                                        className="cgv-pay-review__poster"
                                    />
                                ) : (
                                    <div className="cgv-pay-review__poster-ph">🎬</div>
                                )}
                                <div className="cgv-pay-review__movie-info">
                                    <p className="cgv-pay-review__movie-title">
                                        {movieTitle ?? "—"}
                                    </p>
                                    {cinemaName && (
                                        <p className="cgv-pay-review__movie-meta">
                                            {cinemaName}
                                            {roomName ? ` · ${roomName}` : ""}
                                            {roomType ? ` (${roomType})` : ""}
                                        </p>
                                    )}
                                    {startTime && (
                                        <p className="cgv-pay-review__movie-meta">
                                            {formatDateTime(startTime)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Seats */}
                            {(selectedSeats ?? []).length > 0 && (
                                <div className="cgv-pay-review__section">
                                    <p className="cgv-pay-review__sec-label">Selected Seats</p>
                                    <div className="cgv-pay-seat-chips">
                                        {selectedSeats.map((s) => (
                                            <span key={s.seatId} className="cgv-pay-seat-chip">
                                                {getSeatLabel(s)}
                                            </span>
                                        ))}
                                    </div>
                                    {pricing && (
                                        <p className="cgv-pay-seat-subtotal">
                                            {seatCount} seat{seatCount !== 1 ? "s" : ""} ·{" "}
                                            {formatPrice(pricing.seatsSubTotal)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* F&B */}
                            <div className="cgv-pay-review__section">
                                <p className="cgv-pay-review__sec-label">Food &amp; Beverage</p>
                                {!hasFnb ? (
                                    <p className="cgv-pay-fnb-empty">No F&amp;B</p>
                                ) : fnbDetails.length > 0 ? (
                                    fnbDetails.map((item) => (
                                        <div
                                            key={item.itemId}
                                            className="cgv-pay-fnb-item"
                                        >
                                            <span className="cgv-pay-fnb-name">
                                                {item.quantity}× {item.itemName}
                                            </span>
                                            <span className="cgv-pay-fnb-sub">
                                                {formatPrice(item.subTotal)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    /* pricing loading — show placeholder items */
                                    (fnbItems ?? []).map((item) => (
                                        <div
                                            key={item.itemId}
                                            className="cgv-pay-fnb-item"
                                        >
                                            <span className="cgv-pay-fnb-name">
                                                {item.quantity}× Item #{item.itemId}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: sidebar ── */}
                    <aside className="cgv-pay-sidebar">

                        {/* Pricing */}
                        <div className="cgv-pay-card">
                            <p className="cgv-pay-card__title">Price Details</p>
                            {isPricingLoading ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div className="cgv-pay-skel" style={{ width: "100%" }} />
                                    <div className="cgv-pay-skel" style={{ width: "80%" }} />
                                    <div className="cgv-pay-skel" style={{ width: "60%", marginTop: 4 }} />
                                </div>
                            ) : pricingError ? (
                                <div className="cgv-pay-error">
                                    <span>⚠</span>
                                    <span>{pricingError}</span>
                                </div>
                            ) : pricing ? (
                                <>
                                    <div className="cgv-pay-price-row">
                                        <span>Seats ({seatCount})</span>
                                        <span className="cgv-pay-price-row__val">
                                            {formatPrice(pricing.seatsSubTotal)}
                                        </span>
                                    </div>
                                    {pricing.fnBSubTotal > 0 && (
                                        <div className="cgv-pay-price-row">
                                            <span>Food &amp; Beverage</span>
                                            <span className="cgv-pay-price-row__val">
                                                {formatPrice(pricing.fnBSubTotal)}
                                            </span>
                                        </div>
                                    )}
                                    {pricing.membershipDiscount > 0 && (
                                        <div className="cgv-pay-price-row cgv-pay-price-row--discount">
                                            <span>Membership discount</span>
                                            <span className="cgv-pay-price-row__val">
                                                −{formatPrice(pricing.membershipDiscount)}
                                            </span>
                                        </div>
                                    )}
                                    {pricing.voucherDiscount > 0 && (
                                        <div className="cgv-pay-price-row cgv-pay-price-row--discount">
                                            <span>Voucher</span>
                                            <span className="cgv-pay-price-row__val">
                                                −{formatPrice(pricing.voucherDiscount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="cgv-pay-price-hr" />
                                    <div className="cgv-pay-price-total">
                                        <span className="cgv-pay-price-total__label">
                                            Total
                                        </span>
                                        <span className="cgv-pay-price-total__val">
                                            {formatPrice(pricing.finalAmount)}
                                        </span>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* Voucher */}
                        <div className="cgv-pay-card">
                            <p className="cgv-pay-card__title">Promo Code</p>
                            {voucherStatus === "applied" && appliedCode ? (
                                <div className="cgv-pay-voucher-applied">
                                    <span className="cgv-pay-voucher-applied__code">
                                        🏷 {appliedCode}
                                    </span>
                                    <button
                                        className="cgv-pay-voucher-remove"
                                        onClick={handleRemoveVoucher}
                                        aria-label="Remove voucher"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="cgv-pay-voucher-row">
                                        <input
                                            className="cgv-pay-voucher-input"
                                            type="text"
                                            placeholder="Enter promo code"
                                            value={voucherInput}
                                            onChange={(e) => {
                                                setVoucherInput(e.target.value);
                                                if (voucherStatus === "error") {
                                                    setVoucherStatus("idle");
                                                    setVoucherError(null);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleApplyVoucher();
                                            }}
                                            disabled={isWaiting || voucherStatus === "applying"}
                                        />
                                        <button
                                            className="cgv-pay-voucher-btn"
                                            onClick={handleApplyVoucher}
                                            disabled={!voucherInput.trim() || isWaiting || voucherStatus === "applying"}
                                        >
                                            {voucherStatus === "applying" ? "Checking…" : "Apply"}
                                        </button>
                                    </div>
                                    {voucherStatus === "error" && voucherError && (
                                        <p className="cgv-pay-voucher-error">{voucherError}</p>
                                    )}
                                    {customerId != null && (
                                        <button
                                            type="button"
                                            className="cgv-pay-voucher-picker-link"
                                            onClick={() => setPickerOpen(true)}
                                            disabled={isWaiting || voucherStatus === "applying"}
                                        >
                                            Choose from My Vouchers ›
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Payment method */}
                        {!isWaiting && (
                            <div className="cgv-pay-card">
                                <p className="cgv-pay-card__title">Payment Method</p>
                                {isFreeOrder ? (
                                    <div className="cgv-pay-method cgv-pay-method--free">
                                        <span className="cgv-pay-method__icon">👛</span>
                                        <div className="cgv-pay-method__info">
                                            <p className="cgv-pay-method__name">E-Wallet</p>
                                            <p className="cgv-pay-method__desc">
                                                This order is free — no charge required, confirmed via E-Wallet.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="cgv-pay-methods">
                                        {/* PayOS */}
                                        <div
                                            className={`cgv-pay-method${paymentMethod === "payos" ? " cgv-pay-method--selected" : ""}`}
                                            onClick={() => setPaymentMethod("payos")}
                                            role="radio"
                                            aria-checked={paymentMethod === "payos"}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ")
                                                    setPaymentMethod("payos");
                                            }}
                                        >
                                            <div className="cgv-pay-method__radio">
                                                <div className="cgv-pay-method__radio-dot" />
                                            </div>
                                            <span className="cgv-pay-method__icon">💳</span>
                                            <div className="cgv-pay-method__info">
                                                <p className="cgv-pay-method__name">PayOS</p>
                                                <p className="cgv-pay-method__desc">
                                                    Pay via PayOS gateway (QR / card)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Wallet */}
                                        <div
                                            className={`cgv-pay-method${paymentMethod === "wallet" ? " cgv-pay-method--selected" : ""}`}
                                            onClick={() => setPaymentMethod("wallet")}
                                            role="radio"
                                            aria-checked={paymentMethod === "wallet"}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ")
                                                    setPaymentMethod("wallet");
                                            }}
                                        >
                                            <div className="cgv-pay-method__radio">
                                                <div className="cgv-pay-method__radio-dot" />
                                            </div>
                                            <span className="cgv-pay-method__icon">👛</span>
                                            <div className="cgv-pay-method__info">
                                                <p className="cgv-pay-method__name">E-Wallet</p>
                                                <p
                                                    className={`cgv-pay-method__desc${walletInsufficient ? " cgv-pay-method__desc--warn" : ""}`}
                                                >
                                                    {walletData
                                                        ? walletInsufficient
                                                            ? `Insufficient balance (${formatPrice(walletBalance)})`
                                                            : `Balance: ${formatPrice(walletBalance)}`
                                                        : "Loading balance..."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Waiting state */}
                        {isWaiting && (
                            <div className="cgv-pay-card">
                                <div className="cgv-pay-waiting">
                                    <div className="cgv-pay-waiting__spinner" />
                                    <p className="cgv-pay-waiting__title">
                                        {effectivePaymentMethod === "payos"
                                            ? "Redirecting to PayOS"
                                            : "Processing payment"}
                                    </p>
                                    <p className="cgv-pay-waiting__desc">
                                        {effectivePaymentMethod === "payos"
                                            ? "You'll be redirected to PayOS to complete your payment."
                                            : "Processing your e-wallet payment..."}
                                    </p>
                                    <div className="cgv-pay-waiting__dots">
                                        <div className="cgv-pay-waiting__dot" />
                                        <div className="cgv-pay-waiting__dot" />
                                        <div className="cgv-pay-waiting__dot" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {paymentError && (
                            <div className="cgv-pay-error">
                                <span>⚠</span>
                                <span>{paymentError}</span>
                            </div>
                        )}

                        {/* Pay button */}
                        {!isWaiting && (
                            <button
                                className="cgv-pay-btn"
                                onClick={handlePay}
                                disabled={!canPay}
                            >
                                {isExpired
                                    ? "Seat hold expired"
                                    : walletInsufficient
                                        ? "Insufficient wallet balance"
                                        : isPricingLoading
                                            ? "Loading..."
                                            : pricing
                                                ? `Pay ${formatPrice(pricing.finalAmount)}`
                                                : "Pay"}
                            </button>
                        )}
                    </aside>
                </div>
            </div>

            {/* ── Mobile bottom bar ── */}
            <div className="cgv-pay-mobile-bar" aria-live="polite">
                <div className="cgv-pay-mobile-bar__row">
                    <span className="cgv-pay-mobile-bar__label">Total</span>
                    <span className="cgv-pay-mobile-bar__total">
                        {pricing ? formatPrice(pricing.finalAmount) : "—"}
                    </span>
                </div>
                {!isWaiting && (
                    <button
                        className="cgv-pay-btn"
                        onClick={handlePay}
                        disabled={!canPay}
                    >
                        {isExpired
                            ? "Seat hold expired"
                            : walletInsufficient
                                ? "Insufficient balance"
                                : isPricingLoading
                                    ? "Loading..."
                                    : "Pay"}
                    </button>
                )}
            </div>

            <VoucherPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handlePickVoucher}
            />
        </div>
    );
};

export default PaymentPage;
