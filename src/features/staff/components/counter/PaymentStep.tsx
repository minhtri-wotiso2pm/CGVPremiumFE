import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, InputNumber, message, Modal, QRCode, Skeleton } from "antd";
import axios from "axios";
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking";
import { useInitiatePayment } from "@/features/booking/hooks/useInitiatePayment";
import { confirmCashPaymentApi, getPaymentStatusApi } from "@/services/api/payment.service";
import { formatPrice } from "@/features/booking/utils/seat.utils";
import type { BookingResponse, PaymentInitiateResponse, PricingResponse } from "@/features/booking/types/payment.types";
import type { CounterPaymentMethod, CounterReceipt } from "../../types/counter.types";
import type { LookedUpMember } from "../../types/lookup.types";
import { CashIcon, CardIcon, WalletIcon } from "./icons";
import styles from "./counter.module.css";

interface Props {
    customerId: number | null;
    member: LookedUpMember | null;
    showtimeId: number | null;
    seatIds: number[];
    fnbItems: { itemId: number; quantity: number }[];
    voucherCode: string | null;
    pricing: PricingResponse | null;
    pricingLoading: boolean;
    pricingError: boolean;
    onRetryPricing: () => void;
    onPaid: (receipt: CounterReceipt) => void;
}

const QUICK_TENDER = [50_000, 100_000, 200_000, 500_000];

const errMsg = (err: unknown, fallback: string): string =>
    axios.isAxiosError(err) ? (err.response?.data?.message ?? fallback) : fallback;

const formatCountdown = (ms: number): string => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const PaymentStep: FC<Props> = ({
    customerId, member, showtimeId, seatIds, fnbItems, voucherCode,
    pricing, pricingLoading, pricingError, onRetryPricing, onPaid,
}) => {
    const { mutateAsync: doCreateBooking } = useCreateBooking();
    const { mutateAsync: doInitiatePayment } = useInitiatePayment();

    const [method, setMethod] = useState<CounterPaymentMethod>("cash");
    const [cashReceived, setCashReceived] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payos, setPayos] = useState<PaymentInitiateResponse | null>(null);
    const [payosTimeLeft, setPayosTimeLeft] = useState(0);

    const bookingRef = useRef<BookingResponse | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isGuest = customerId == null;
    const walletBalance = member?.wallet?.balance ?? 0;
    const finalAmount = pricing?.finalAmount ?? 0;
    const hasFnb = fnbItems.length > 0;

    // Live mm:ss countdown to the PayOS session's expiry, shown next to the QR
    // (the QR panel itself only renders while `payos` is set, so there's no
    // stale value to worry about between attempts).
    useEffect(() => {
        if (!payos?.expiresAt) return;
        const expiresAt = new Date(payos.expiresAt).getTime();
        const id = setInterval(() => {
            setPayosTimeLeft(Math.max(0, expiresAt - Date.now()));
        }, 1_000);
        return () => clearInterval(id);
    }, [payos?.expiresAt]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }, []);
    useEffect(() => () => stopPolling(), [stopPolling]);

    const complete = useCallback(
        (bkg: BookingResponse, usedMethod: CounterPaymentMethod) => {
            const receipt: CounterReceipt = {
                booking: bkg,
                paymentMethod: usedMethod,
                amountPaid: finalAmount,
                memberName: member?.fullName ?? null,
                hasFnb,
                ...(usedMethod === "cash" && cashReceived != null
                    ? { cashReceived, change: Math.max(0, cashReceived - finalAmount) }
                    : {}),
            };
            onPaid(receipt);
        },
        [finalAmount, member, hasFnb, cashReceived, onPaid],
    );

    // A payment attempt that ends up here is dead — discard the booking it was
    // tied to so the next "Pay" click always creates a brand-new one instead of
    // re-initiating payment against the same failed booking. The old booking is
    // only kept in a console trail for debugging, never shown to staff.
    const abandonFailedBooking = useCallback((reason: string) => {
        const failed = bookingRef.current;
        if (failed) {
            console.debug("[counter-payment] booking abandoned after failure, next Pay starts fresh", {
                failedBookingId: failed.bookingID,
                failedBookingCode: failed.bookingCode,
                reason,
            });
        }
        bookingRef.current = null;
        setPayos(null);
    }, []);

    const startPolling = useCallback(
        (paymentId: number, usedMethod: CounterPaymentMethod) => {
            let count = 0;
            pollRef.current = setInterval(async () => {
                count += 1;
                if (count > 200) {
                    stopPolling();
                    abandonFailedBooking("session expired");
                    message.error("Payment session expired.");
                    setError("Payment session expired. Please try again — this will start a new order.");
                    setIsProcessing(false);
                    return;
                }
                try {
                    const s = (await getPaymentStatusApi(paymentId)).status?.toUpperCase();
                    if (s === "SUCCESS") {
                        stopPolling();
                        complete(bookingRef.current!, usedMethod);
                    } else if (s === "FAILED" || s === "EXPIRED" || s === "CANCELLED") {
                        stopPolling();
                        abandonFailedBooking(s);
                        message.error("Payment failed or was cancelled.");
                        setError("Payment failed or was cancelled. Please try again — this will start a new order.");
                        setIsProcessing(false);
                    }
                } catch { /* transient — keep polling */ }
            }, 3_000);
        },
        [stopPolling, complete, abandonFailedBooking],
    );

    /* ── Pay ── */
    const doPay = useCallback(async () => {
        setError(null);
        setIsProcessing(true);
        setPayos(null);
        try {
            const booking = bookingRef.current
                ?? await doCreateBooking({ customerId, showtimeId, seatIds, fnbItems, voucherCode });
            bookingRef.current = booking;

            const init = await doInitiatePayment({ bookingId: booking.bookingID, paymentMethod: method });
            const status = (init.status ?? "").toUpperCase();

            if (method === "cash") {
                // Cash is created by initiate but only settles once the counter
                // confirms the money was taken.
                const confirmed = await confirmCashPaymentApi(init.paymentId);
                if ((confirmed.status ?? "").toUpperCase() === "SUCCESS") {
                    complete(booking, "cash");
                } else {
                    abandonFailedBooking("cash confirm failed");
                    message.error("Couldn't confirm the cash payment.");
                    setError("Couldn't confirm the cash payment. Please try again — this will start a new order.");
                    setIsProcessing(false);
                }
                return;
            }

            if (method === "payos" && status !== "SUCCESS") {
                // Show the customer the PayOS QR / link and wait for confirmation.
                setPayos(init);
                startPolling(init.paymentId, "payos");
                return;
            }

            if (status === "SUCCESS") {
                complete(booking, method);
                return;
            }

            // Wallet that didn't resolve synchronously — poll as a fallback.
            startPolling(init.paymentId, method);
        } catch (err) {
            // A booking may already have been created even though initiating
            // payment on it failed — abandon it so retry starts completely fresh.
            abandonFailedBooking("create/initiate error");
            setIsProcessing(false);
            const msg = errMsg(err, "Something went wrong taking payment. Please try again.");
            message.error(msg);
            setError(`${msg} This will start a new order.`);
        }
    }, [customerId, showtimeId, seatIds, fnbItems, voucherCode, method, doCreateBooking, doInitiatePayment, startPolling, complete, abandonFailedBooking]);

    const handlePay = useCallback(() => {
        if (method === "wallet") {
            Modal.confirm({
                title: "Charge member wallet?",
                content: `${formatPrice(finalAmount)} will be deducted from ${member?.fullName ?? "the member"}'s wallet (balance ${formatPrice(walletBalance)}).`,
                okText: "Charge wallet",
                cancelText: "Cancel",
                onOk: doPay,
            });
        } else {
            doPay();
        }
    }, [method, finalAmount, member, walletBalance, doPay]);

    /* ── Derived ── */
    const walletInsufficient = walletBalance < finalAmount;
    const change = cashReceived != null ? cashReceived - finalAmount : null;
    const cashOk = method !== "cash" || (cashReceived != null && cashReceived >= finalAmount);
    const canPay = !!pricing && !isProcessing && cashOk && (method !== "wallet" || (!isGuest && !walletInsufficient));

    if (pricingLoading) {
        return <div className="dash-card" style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 5 }} /></div>;
    }
    if (pricingError || !pricing) {
        return (
            <div className="dash-card" style={{ padding: 24 }}>
                <Alert type="error" message="Couldn't calculate the order total. Please try again." showIcon />
                <Button style={{ marginTop: 16 }} onClick={onRetryPricing}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="dash-card" style={{ padding: 24 }}>
            <div className={styles.stepHeadRow}>
                <div>
                    <h2 className={styles.stepHeadTitle}>Payment</h2>
                    <p className={styles.stepHeadSub}>Choose how the customer is paying.</p>
                </div>
            </div>

            {/* Price breakdown */}
            {pricing && (
                <div style={{ marginBottom: 20 }}>
                    {pricing.membershipDiscount > 0 && (
                        <div className={styles.railLine} style={{ fontSize: 14 }}>
                            <span className={styles.railLineName}>Membership discount</span>
                            <span className={styles.railLineVal} style={{ color: "#147a40" }}>
                                −{formatPrice(pricing.membershipDiscount)}
                            </span>
                        </div>
                    )}
                    {pricing.voucherDiscount > 0 && (
                        <div className={styles.railLine} style={{ fontSize: 14 }}>
                            <span className={styles.railLineName}>
                                Voucher{pricing.voucherDetails ? ` · ${pricing.voucherDetails.voucherCode}` : ""}
                            </span>
                            <span className={styles.railLineVal} style={{ color: "#147a40" }}>
                                −{formatPrice(pricing.voucherDiscount)}
                            </span>
                        </div>
                    )}
                    <div className={styles.railTotal} style={{ marginTop: 8 }}>
                        <span className={styles.railTotalLabel}>Total to pay</span>
                        <span className={styles.railTotalVal}>{formatPrice(finalAmount)}</span>
                    </div>
                </div>
            )}

            {/* Methods */}
            <div className={styles.payMethods}>
                <button
                    type="button"
                    className={`${styles.payMethod} ${method === "cash" ? styles.payMethodActive : ""}`}
                    onClick={() => setMethod("cash")}
                >
                    <span className={styles.payMethodIcon}><CashIcon size={26} /></span>
                    <span className={styles.payMethodTitle}>Cash</span>
                    <span className={styles.payMethodSub}>Pay at the counter</span>
                </button>

                <button
                    type="button"
                    className={`${styles.payMethod} ${method === "wallet" ? styles.payMethodActive : ""}`}
                    disabled={isGuest || walletInsufficient}
                    title={isGuest ? "Guests can't use a wallet" : walletInsufficient ? "Insufficient wallet balance" : ""}
                    onClick={() => setMethod("wallet")}
                >
                    <span className={styles.payMethodIcon}><WalletIcon size={26} /></span>
                    <span className={styles.payMethodTitle}>Wallet</span>
                    <span className={styles.payMethodSub}>
                        {isGuest ? "Member only" : `Balance ${formatPrice(walletBalance)}`}
                    </span>
                </button>

                <button
                    type="button"
                    className={`${styles.payMethod} ${method === "payos" ? styles.payMethodActive : ""}`}
                    onClick={() => setMethod("payos")}
                >
                    <span className={styles.payMethodIcon}><CardIcon size={26} /></span>
                    <span className={styles.payMethodTitle}>PayOS</span>
                    <span className={styles.payMethodSub}>QR / online payment</span>
                </button>
            </div>

            {/* Cash tender */}
            {method === "cash" && (
                <div className={styles.tenderPanel}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span className={styles.changeLabel}>Amount received</span>
                        <InputNumber
                            value={cashReceived ?? undefined}
                            onChange={(v) => setCashReceived(typeof v === "number" ? v : null)}
                            min={0}
                            step={10_000}
                            style={{ width: 180 }}
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            parser={(v) => Number((v ?? "").replace(/\./g, ""))}
                            addonAfter="₫"
                        />
                    </div>
                    <div className={styles.tenderChips}>
                        {QUICK_TENDER.map((amt) => (
                            <button key={amt} type="button" className={styles.tenderChip} onClick={() => setCashReceived(amt)}>
                                {amt.toLocaleString("vi-VN")}
                            </button>
                        ))}
                        <button type="button" className={styles.tenderChip} onClick={() => setCashReceived(finalAmount)}>
                            Exact
                        </button>
                    </div>
                    <div className={styles.changeRow}>
                        <span className={styles.changeLabel}>Change</span>
                        {change == null ? (
                            <span className={styles.changeLabel}>—</span>
                        ) : change < 0 ? (
                            <span className={styles.changeShort}>Short {formatPrice(-change)}</span>
                        ) : (
                            <span className={styles.changeVal}>{formatPrice(change)}</span>
                        )}
                    </div>
                </div>
            )}

            {/* PayOS QR — rendered immediately once the payment is initiated, no click needed */}
            {method === "payos" && payos && (
                <div className={`${styles.tenderPanel} ${styles.qrWrap}`}>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--dash-text-1)" }}>
                        Have the customer scan this to pay with PayOS
                    </p>
                    <QRCode
                        value={payos.qrCode || payos.checkoutUrl || " "}
                        size={220}
                        bordered={false}
                        className={styles.qrImg}
                    />
                    <span className={styles.qrAmount}>{formatPrice(finalAmount)}</span>
                    {payosTimeLeft > 0 && (
                        <span className={styles.qrCountdown}>Expires in {formatCountdown(payosTimeLeft)}</span>
                    )}
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        Waiting for payment confirmation…
                    </p>
                    {payos.checkoutUrl && (
                        <Button
                            type="link"
                            size="small"
                            className={styles.qrFallbackLink}
                            onClick={() => window.open(payos.checkoutUrl, "_blank", "noopener")}
                        >
                            Or open the full payment page
                        </Button>
                    )}
                </div>
            )}

            {error && <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} style={{ marginBottom: 16 }} />}

            <Button
                type="primary"
                size="large"
                block
                loading={isProcessing}
                disabled={!canPay}
                onClick={handlePay}
            >
                {error
                    ? `Try again — new order (${formatPrice(finalAmount)})`
                    : method === "cash"
                        ? `Take ${formatPrice(finalAmount)} cash`
                        : method === "wallet"
                            ? `Charge wallet ${formatPrice(finalAmount)}`
                            : `Pay ${formatPrice(finalAmount)} with PayOS`}
            </Button>
        </div>
    );
};

export default PaymentStep;
