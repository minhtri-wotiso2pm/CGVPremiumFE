import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { QRCode } from "antd";
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
import { FilmClapperIcon } from "@/components/ui/BrandIcons";
import { useWallet } from "../hooks/useWallet";
import { getPaymentStatusApi } from "@/services/api/payment.service";
import { formatPrice, getSeatLabel } from "../utils/seat.utils";
import { formatDateTime } from "@/utils/formatDate";
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

// Same breakpoint the layout itself collapses at (payment.css:928) — below
// it the customer is on their own phone with no second device to scan a QR
// with, so PayOS's checkoutUrl deep-link into the banking app is the correct
// UX, not an unscannable QR on the same screen.
const MOBILE_LAYOUT_QUERY = "(max-width: 960px)";

function useIsMobileLayout(): boolean {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== "undefined" && window.matchMedia(MOBILE_LAYOUT_QUERY).matches,
    );
    useEffect(() => {
        const mql = window.matchMedia(MOBILE_LAYOUT_QUERY);
        const onChange = () => setIsMobile(mql.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);
    return isMobile;
}

/* ══════════════════════════════════════════
   PaymentPage
══════════════════════════════════════════ */
const PaymentPage: FC = () => {
    const { t } = useTranslation("booking");
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
        cinemaId,
        cinemaName,
        movieId,
        roomId,
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
    const isMobileLayout = useIsMobileLayout();

    /* ── PayOS inline QR (desktop only — see useIsMobileLayout) ── */
    const [payosInit, setPayosInit] = useState<PaymentInitiateResponse | null>(null);
    const [payosTimeLeft, setPayosTimeLeft] = useState(0);
    const [paymentSucceeded, setPaymentSucceeded] = useState(false);

    useEffect(() => {
        if (!payosInit?.expiresAt) return;
        const expiresAt = new Date(payosInit.expiresAt).getTime();
        const id = setInterval(() => {
            setPayosTimeLeft(Math.max(0, expiresAt - Date.now()));
        }, 1_000);
        return () => clearInterval(id);
    }, [payosInit?.expiresAt]);

    /* ── Refs for polling ─────────────────── */
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
                setPricingError(t("payment.pricingError"));
            } finally {
                setIsPricingLoading(false);
            }
        },
        [calcPricing, showtimeId, seatIds, fnbItems, customerId, t],
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
                setVoucherError(msg ?? t("payment.voucherInvalid"));
                setVoucherStatus("error");
            }
        },
        [calcPricing, showtimeId, seatIds, fnbItems, customerId, t],
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
    useEffect(() => () => {
        if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    }, []);

    const startPolling = useCallback(
        (paymentId: number, isQrFlow: boolean = false) => {
            let count = 0;
            pollIntervalRef.current = setInterval(async () => {
                count += 1;
                if (count > 200) {
                    stopPolling();
                    setPayosInit(null);
                    setPaymentError(t("payment.sessionExpired"));
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
                        const goToConfirmation = () => navigate("/customer/booking/confirmation", {
                            state: confirmState,
                            replace: true,
                        });
                        if (isQrFlow) {
                            // Let the success tick animation play before leaving the QR card.
                            setPaymentSucceeded(true);
                            navigateTimeoutRef.current = setTimeout(goToConfirmation, 700);
                        } else {
                            goToConfirmation();
                        }
                    } else if (s === "FAILED" || s === "EXPIRED" || s === "CANCELLED") {
                        stopPolling();
                        setPayosInit(null);
                        setPaymentError(t("payment.paymentFailed"));
                        setIsWaiting(false);
                    }
                } catch {
                    /* network hiccup — keep polling */
                }
            }, 3_000);
        },
        [stopPolling, navigate, moviePoster, roomType, t],
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
        setPayosInit(null);
        setPaymentSucceeded(false);
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
                if (isMobileLayout) {
                    // No second device to scan a QR with on the customer's own
                    // phone — full-page redirect (not a new tab) so PayOS's
                    // configured returnUrl/cancelUrl deep-links straight back
                    // into this same tab/app.
                    window.location.href = paymentInit.checkoutUrl;
                    return;
                }
                // Desktop — embed the QR inline instead of leaving the page.
                setPayosInit(paymentInit);
                startPolling(paymentInit.paymentId, true);
                return;
            }

            startPolling(paymentInit.paymentId);
        } catch (err: unknown) {
            setIsWaiting(false);
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setPaymentError(msg ?? t("common:errors.generic"));
        }
    }, [
        pricing, isExpired, doCreateBooking, doInitiatePayment, customerId,
        showtimeId, seatIds, fnbItems, appliedCode, effectivePaymentMethod, startPolling, isMobileLayout, t,
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
                    <button className="cgv-pay-back-btn" onClick={handleBack} aria-label={t("payment.backToFnb")}>
                        <BackIcon />
                    </button>
                    <div className="cgv-pay-step cgv-pay-step--done">
                        <span className="cgv-pay-step__num">✓</span>
                        {t("fnb.stepSeats")}
                    </div>
                    <div className="cgv-pay-step__sep" />
                    <div className="cgv-pay-step cgv-pay-step--done">
                        <span className="cgv-pay-step__num">✓</span>
                        {t("fnb.stepFnb")}
                    </div>
                    <div className="cgv-pay-step__sep" />
                    <div className="cgv-pay-step cgv-pay-step--active">
                        <span className="cgv-pay-step__num">3</span>
                        {t("fnb.stepPayment")}
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
                                {t("fnb.holdExpired")}
                            </span>
                        ) : (
                            <>
                                <span>{t("fnb.holdFor")}</span>
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
                                    <div className="cgv-pay-review__poster-ph"><FilmClapperIcon size={24} /></div>
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
                                    <p className="cgv-pay-review__sec-label">{t("fnb.selectedSeats")}</p>
                                    <div className="cgv-pay-seat-chips">
                                        {selectedSeats.map((s) => (
                                            <span key={s.seatId} className="cgv-pay-seat-chip">
                                                {getSeatLabel(s)}
                                            </span>
                                        ))}
                                    </div>
                                    {pricing && (
                                        <p className="cgv-pay-seat-subtotal">
                                            {t("seats.seatsCount", { count: seatCount })} ·{" "}
                                            {formatPrice(pricing.seatsSubTotal)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* F&B */}
                            <div className="cgv-pay-review__section">
                                <p className="cgv-pay-review__sec-label">{t("fnb.foodBeverage")}</p>
                                {!hasFnb ? (
                                    <p className="cgv-pay-fnb-empty">{t("payment.noFnb")}</p>
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
                                                {item.quantity}× {t("payment.itemPlaceholder", { id: item.itemId })}
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
                            <p className="cgv-pay-card__title">{t("payment.priceDetails")}</p>
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
                                        <span>{t("fnb.seatsCount", { count: seatCount })}</span>
                                        <span className="cgv-pay-price-row__val">
                                            {formatPrice(pricing.seatsSubTotal)}
                                        </span>
                                    </div>
                                    {pricing.fnBSubTotal > 0 && (
                                        <div className="cgv-pay-price-row">
                                            <span>{t("fnb.foodBeverage")}</span>
                                            <span className="cgv-pay-price-row__val">
                                                {formatPrice(pricing.fnBSubTotal)}
                                            </span>
                                        </div>
                                    )}
                                    {pricing.membershipDiscount > 0 && (
                                        <div className="cgv-pay-price-row cgv-pay-price-row--discount">
                                            <span>{t("payment.membershipDiscount")}</span>
                                            <span className="cgv-pay-price-row__val">
                                                −{formatPrice(pricing.membershipDiscount)}
                                            </span>
                                        </div>
                                    )}
                                    {pricing.voucherDiscount > 0 && (
                                        <div className="cgv-pay-price-row cgv-pay-price-row--discount">
                                            <span>{t("payment.voucher")}</span>
                                            <span className="cgv-pay-price-row__val">
                                                −{formatPrice(pricing.voucherDiscount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="cgv-pay-price-hr" />
                                    <div className="cgv-pay-price-total">
                                        <span className="cgv-pay-price-total__label">
                                            {t("seats.total")}
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
                            <p className="cgv-pay-card__title">{t("payment.promoCode")}</p>
                            {voucherStatus === "applied" && appliedCode ? (
                                <div className="cgv-pay-voucher-applied">
                                    <span className="cgv-pay-voucher-applied__code">
                                        🏷 {appliedCode}
                                    </span>
                                    <button
                                        className="cgv-pay-voucher-remove"
                                        onClick={handleRemoveVoucher}
                                        aria-label={t("payment.removeVoucher")}
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
                                            placeholder={t("payment.promoPlaceholder")}
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
                                            {voucherStatus === "applying" ? t("payment.checking") : t("payment.apply")}
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
                                            {t("payment.chooseFromMyVouchers")}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Payment method */}
                        {!isWaiting && (
                            <div className="cgv-pay-card">
                                <p className="cgv-pay-card__title">{t("payment.paymentMethod")}</p>
                                {isFreeOrder ? (
                                    <div className="cgv-pay-method cgv-pay-method--free">
                                        <span className="cgv-pay-method__icon">👛</span>
                                        <div className="cgv-pay-method__info">
                                            <p className="cgv-pay-method__name">{t("payment.eWallet")}</p>
                                            <p className="cgv-pay-method__desc">
                                                {t("payment.freeOrder")}
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
                                                    {t("payment.payosDesc")}
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
                                                <p className="cgv-pay-method__name">{t("payment.eWallet")}</p>
                                                <p
                                                    className={`cgv-pay-method__desc${walletInsufficient ? " cgv-pay-method__desc--warn" : ""}`}
                                                >
                                                    {walletData
                                                        ? walletInsufficient
                                                            ? t("payment.insufficientBalanceAmount", { amount: formatPrice(walletBalance) })
                                                            : t("payment.balanceAmount", { amount: formatPrice(walletBalance) })
                                                        : t("payment.loadingBalance")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Waiting state */}
                        {isWaiting && payosInit ? (
                            <div className="cgv-pay-card">
                                {paymentSucceeded ? (
                                    <div className="cgv-pay-qr-card">
                                        <div className="cgv-pay-qr-success">✓</div>
                                        <p className="cgv-pay-waiting__title">{t("payment.successTitle")}</p>
                                        <p className="cgv-pay-waiting__desc">{t("payment.successDesc")}</p>
                                    </div>
                                ) : (
                                    <div className="cgv-pay-qr-card">
                                        <p className="cgv-pay-waiting__title">{t("payment.scanToPay")}</p>
                                        <div className="cgv-pay-qr-ring">
                                            <div className="cgv-pay-qr-img">
                                                <QRCode
                                                    value={payosInit.qrCode || payosInit.checkoutUrl || " "}
                                                    size={188}
                                                    bordered={false}
                                                />
                                            </div>
                                        </div>
                                        <span className="cgv-pay-qr-amount">
                                            {formatPrice(pricing?.finalAmount ?? payosInit.amount)}
                                        </span>
                                        {payosTimeLeft > 0 && (
                                            <span className="cgv-pay-qr-countdown">
                                                {t("payment.expiresIn", { time: formatCountdown(payosTimeLeft) })}
                                            </span>
                                        )}
                                        <p className="cgv-pay-waiting__desc">
                                            {t("payment.scanHint")}
                                        </p>
                                        {payosInit.checkoutUrl && (
                                            <button
                                                type="button"
                                                className="cgv-pay-qr-fallback"
                                                onClick={() => window.open(payosInit.checkoutUrl, "_blank", "noopener")}
                                            >
                                                {t("payment.openFullPage")}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : isWaiting && (
                            <div className="cgv-pay-card">
                                <div className="cgv-pay-waiting">
                                    <div className="cgv-pay-waiting__spinner" />
                                    <p className="cgv-pay-waiting__title">
                                        {effectivePaymentMethod === "payos"
                                            ? t("payment.redirectingTitle")
                                            : t("payment.processingTitle")}
                                    </p>
                                    <p className="cgv-pay-waiting__desc">
                                        {effectivePaymentMethod === "payos"
                                            ? t("payment.redirectingDesc")
                                            : t("payment.processingDesc")}
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
                                    ? t("payment.holdExpiredBtn")
                                    : walletInsufficient
                                        ? t("payment.insufficientWallet")
                                        : isPricingLoading
                                            ? t("common:status.loading")
                                            : pricing
                                                ? t("payment.payAmount", { amount: formatPrice(pricing.finalAmount) })
                                                : t("payment.pay")}
                            </button>
                        )}
                    </aside>
                </div>
            </div>

            {/* ── Mobile bottom bar ── */}
            <div className="cgv-pay-mobile-bar" aria-live="polite">
                <div className="cgv-pay-mobile-bar__row">
                    <span className="cgv-pay-mobile-bar__label">{t("seats.total")}</span>
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
                            ? t("payment.holdExpiredBtn")
                            : walletInsufficient
                                ? t("payment.insufficientBalance")
                                : isPricingLoading
                                    ? t("common:status.loading")
                                    : t("payment.pay")}
                    </button>
                )}
            </div>

            <VoucherPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handlePickVoucher}
                seatsSubTotal={pricing?.seatsSubTotal}
                fnBSubTotal={pricing?.fnBSubTotal}
                cinemaId={cinemaId}
                startTime={startTime}
                movieId={movieId}
                roomId={roomId}
                seatTypes={(selectedSeats ?? []).map((s) => String(s.seatType))}
                productIds={(fnbItems ?? []).map((i) => i.itemId)}
                appliedCode={appliedCode}
            />
        </div>
    );
};

export default PaymentPage;
