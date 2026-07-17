import { useRef, useState } from "react";
import { Alert, Button, Input, Skeleton } from "antd";
import type { InputRef } from "antd";
import QrScanner from "../components/QrScanner";
import { useBookingLookup, useConfirmFnbPickup } from "../hooks/useFnbPickup";
import { getCheckInErrorInfo } from "../hooks/useCheckIn";
import type { BookingLookupResult } from "../types/fnbPickup.types";
import styles from "./FnbPickupPage.module.css";

const { Search } = Input;

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const initials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("") || "?";

/* ── Apple-style line icons: 24-grid, rounded, hand-drawn ── */
const CheckDotIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
    </svg>
);

const BagLargeIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8h12l-.8 10.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
);

const SuccessCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
    </svg>
);

// Some backends signal business failures with HTTP 200 + { success: false },
// others with a 4xx. This normalizes both into one message.
const isPaid = (status: string) => /paid|completed|success/i.test(status);

export default function FnbPickupPage() {
    const searchRef = useRef<InputRef>(null);

    const [codeInput, setCodeInput] = useState("");
    const [scanning, setScanning] = useState(false);
    const [lookupError, setLookupError] = useState<{ message: string; kind: "network" | "business" } | null>(null);
    const [actionError, setActionError] = useState<{ message: string; kind: "network" | "business" } | null>(null);
    const [result, setResult] = useState<BookingLookupResult | null>(null);
    const [justConfirmed, setJustConfirmed] = useState(false);

    const lookupMutation = useBookingLookup();
    const confirmMutation = useConfirmFnbPickup();

    const resetForNext = () => {
        setCodeInput("");
        setResult(null);
        setLookupError(null);
        setActionError(null);
        setJustConfirmed(false);
        searchRef.current?.focus();
    };

    const runLookup = (code: string, opts?: { silent?: boolean }) => {
        const trimmed = code.trim();
        if (!trimmed) return;
        if (!opts?.silent) {
            setLookupError(null);
            setActionError(null);
            setJustConfirmed(false);
        }
        lookupMutation.mutate(trimmed, {
            onSuccess: (res) => {
                if (res.success && res.data) {
                    setResult(res.data);
                    if (!opts?.silent) setLookupError(null);
                } else if (!opts?.silent) {
                    setResult(null);
                    setLookupError({ message: res.message || "Booking not found.", kind: "business" });
                }
            },
            onError: (err) => {
                if (opts?.silent) return;
                setResult(null);
                setLookupError(getCheckInErrorInfo(err, "Could not find a booking for this code."));
            },
        });
    };

    const handleScan = (text: string) => {
        setCodeInput(text);
        runLookup(text);
    };

    const handleConfirm = () => {
        if (!result) return;
        setActionError(null);
        confirmMutation.mutate(result.bookingCode, {
            onSuccess: () => {
                setJustConfirmed(true);
                // Re-fetch so the item list reflects the new pickedUp state.
                runLookup(result.bookingCode, { silent: true });
            },
            onError: (err) => {
                setActionError(getCheckInErrorInfo(err, "Could not confirm pickup."));
            },
        });
    };

    const allPickedUp = result ? result.fnbItems.every((i) => i.pickedUp) : false;
    const notPaid = result ? !isPaid(result.paymentStatus) : false;

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header">
                <div>
                    <h1 className="dash-page-title">F&amp;B Pickup</h1>
                    <p className="dash-page-sub">
                        Enter or scan a booking code to review the order, then confirm the customer has collected their food &amp; drinks.
                    </p>
                </div>
            </div>

            <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
                <div className={styles.lookupRow}>
                    <Search
                        ref={searchRef}
                        placeholder="Booking code, e.g. BK2026..."
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        onSearch={(v) => runLookup(v)}
                        loading={lookupMutation.isPending}
                        enterButton="Look up"
                        style={{ maxWidth: 340 }}
                        autoFocus
                    />
                    <Button onClick={() => setScanning((v) => !v)}>
                        {scanning ? "Stop camera" : "Scan code"}
                    </Button>
                    {result && (
                        <Button type="text" onClick={resetForNext}>
                            New lookup
                        </Button>
                    )}
                </div>

                {scanning && (
                    <div className={styles.scannerWrap}>
                        <QrScanner
                            active={scanning}
                            onScan={handleScan}
                            onError={(m) => setLookupError({ message: m, kind: "business" })}
                        />
                        <p className={styles.scannerHint}>
                            Point the camera at the booking code on the customer's receipt or app.
                        </p>
                    </div>
                )}
            </div>

            {lookupMutation.isPending && !result && (
                <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
                    <Skeleton active title={false} paragraph={{ rows: 3 }} />
                </div>
            )}

            {lookupError && (
                <Alert
                    type={lookupError.kind === "network" ? "warning" : "error"}
                    message={lookupError.message}
                    showIcon
                    closable
                    style={{ marginBottom: 20 }}
                    onClose={() => setLookupError(null)}
                />
            )}

            {!result && !lookupMutation.isPending && !lookupError && (
                <div className="dash-card" style={{ marginBottom: 20 }}>
                    <div className={styles.emptyPrompt}>
                        <span className={styles.emptyIcon}><BagLargeIcon /></span>
                        <p className={styles.emptyTitle}>No order loaded</p>
                        <p className={styles.emptyBody}>
                            Look up a booking to see its food &amp; beverage items and confirm pickup.
                        </p>
                    </div>
                </div>
            )}

            {result && (
                <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
                    {justConfirmed && (
                        <div className={styles.successBanner}>
                            <SuccessCheckIcon />
                            <span>Pickup confirmed — order handed to the customer.</span>
                        </div>
                    )}

                    <div className={styles.resultHead}>
                        <div className={styles.customer}>
                            <div className={styles.avatar}>{initials(result.customerName)}</div>
                            <div>
                                <div className={styles.customerName}>{result.customerName || "Guest"}</div>
                                <div className={styles.customerMeta}>
                                    <span className={styles.code}>{result.bookingCode}</span>
                                    {result.customerPhone ? ` · ${result.customerPhone}` : ""}
                                </div>
                            </div>
                        </div>
                        <div className={styles.badges}>
                            <span className={`dash-badge ${isPaid(result.paymentStatus) ? "dash-badge--active" : "dash-badge--pending"}`}>
                                Payment: {result.paymentStatus}
                            </span>
                            <span className={`dash-badge ${allPickedUp ? "dash-badge--active" : "dash-badge--pending"}`}>
                                {allPickedUp ? "Picked up" : "Awaiting pickup"}
                            </span>
                        </div>
                    </div>

                    {notPaid && (
                        <Alert
                            type="error"
                            showIcon
                            message="This booking is not paid — do not hand over the order."
                            style={{ marginTop: 16 }}
                        />
                    )}

                    <p className={styles.sectionLabel}>Food &amp; Beverage</p>
                    <div className={styles.items}>
                        {result.fnbItems.map((item) => (
                            <div
                                key={item.itemId}
                                className={`${styles.item} ${item.pickedUp ? styles.itemPicked : ""}`}
                            >
                                <span className={styles.qtyPill}>×{item.quantity}</span>
                                <span className={`${styles.itemName} ${item.pickedUp ? styles.itemNamePicked : ""}`}>
                                    {item.itemName}
                                </span>
                                {item.pickedUp && (
                                    <span className={styles.checkDot} title="Already picked up">
                                        <CheckDotIcon />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {actionError && (
                        <Alert
                            type={actionError.kind === "network" ? "warning" : "error"}
                            message={actionError.message}
                            showIcon
                            closable
                            style={{ marginTop: 16 }}
                            onClose={() => setActionError(null)}
                        />
                    )}

                    <div className={styles.footer}>
                        <div>
                            <div className={styles.totalLabel}>Order total</div>
                            <div className={styles.totalVal}>{fmtVnd(result.totalAmount)}</div>
                        </div>
                        {allPickedUp ? (
                            <Button size="large" onClick={resetForNext}>
                                Next order
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleConfirm}
                                loading={confirmMutation.isPending}
                                disabled={notPaid}
                            >
                                Confirm pickup
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
