import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { FnbItem, FnbNavState, PaymentNavState, Product } from "../types/fnb.types";
import { useFnbProducts } from "../hooks/useFnbProducts";
import { setActiveSeatHold } from "../utils/activeSeatHold";
import { formatPrice, getSeatLabel } from "../utils/seat.utils";
import { formatDateTime } from "@/utils/formatDate";
import FnbProductCard from "../components/FnbProductCard";
import { FilmClapperIcon } from "@/components/ui/BrandIcons";
import "../components/fnb.css";

/* ── Helpers ──────────────────────────────── */
const GROUP_LABEL_KEYS: Record<string, string> = {
    combo:    "fnb.groupCombo",
    snack:    "fnb.groupSnacks",
    food:     "fnb.groupFood",
    drink:    "fnb.groupDrinks",
    beverage: "fnb.groupDrinks",
};

/** Fixed display order regardless of what order the API returns products
 *  in: Combo first, then Snacks, then Drinks, then everything else. */
const GROUP_ORDER = ["combo", "snack", "drink", "beverage", "food"];

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

function groupProducts(products: Product[]) {
    const map = new Map<string, Product[]>();
    for (const p of products) {
        const key = (p.itemType ?? "other").toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
    }
    const entries = Array.from(map.entries());
    entries.sort(([a], [b]) => {
        const ia = GROUP_ORDER.indexOf(a);
        const ib = GROUP_ORDER.indexOf(b);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });
    return entries.map(([type, items]) => ({
        type,
        labelKey: GROUP_LABEL_KEYS[type] ?? null,
        items,
    }));
}

/* ── Skeleton card ────────────────────────── */
const SkeletonGrid: FC = () => (
    <div className="cgv-fnb-grid" style={{ marginBottom: 32 }}>
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden" }}>
                <div className="cgv-fnb-skel" style={{ height: 110 }} />
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="cgv-fnb-skel" style={{ height: 10, width: "40%" }} />
                    <div className="cgv-fnb-skel" style={{ height: 14, width: "75%" }} />
                    <div className="cgv-fnb-skel" style={{ height: 11, width: "90%" }} />
                    <div className="cgv-fnb-skel" style={{ height: 11, width: "60%" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <div className="cgv-fnb-skel" style={{ height: 14, width: "35%" }} />
                        <div className="cgv-fnb-skel" style={{ height: 26, width: 72, borderRadius: 20 }} />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/* ══════════════════════════════════════════
   FnbPage
══════════════════════════════════════════ */
const FnbPage: FC = () => {
    const { t } = useTranslation("booking");
    const navigate  = useNavigate();
    const { state } = useLocation();
    const navState  = (state ?? {}) as FnbNavState;

    const {
        showtimeId,
        seatIds,
        selectedSeats,
        holdExpiresAt,
        cinemaId,
        movieTitle,
        moviePoster,
        cinemaName,
        roomName,
        startTime,
    } = navState;

    /* ── Redirect if there's no valid nav state ── */
    useEffect(() => {
        if (!showtimeId) navigate("/customer", { replace: true });
    }, [showtimeId, navigate]);

    /* ── Register the active hold for the app-level back guard ────
       useSeatHoldBackGuard (mounted once in App.tsx) releases this hold
       if the user presses browser Back all the way to Seat Selection.
       See activeSeatHold.ts for why the listener can't live here. */
    useEffect(() => {
        if (showtimeId && seatIds?.length) {
            setActiveSeatHold({ showtimeId, seatIds });
        }
    }, [showtimeId, seatIds]);

    /* ── F&B state: itemId → quantity ────────── */
    const [fnbItems, setFnbItems] = useState<Map<number, number>>(new Map());

    /* ── Countdown timer ──────────────────────── */
    const [timeLeft, setTimeLeft] = useState<number>(() =>
        holdExpiresAt ? Math.max(0, new Date(holdExpiresAt).getTime() - Date.now()) : 0
    );

    useEffect(() => {
        if (!holdExpiresAt) return;
        const id = setInterval(() => {
            setTimeLeft(Math.max(0, new Date(holdExpiresAt).getTime() - Date.now()));
        }, 1_000);
        return () => clearInterval(id);
    }, [holdExpiresAt]);

    const isExpired = holdExpiresAt ? timeLeft === 0 : false;
    const isUrgent  = timeLeft > 0 && timeLeft < 2 * 60_000;

    /* ── Products ─────────────────────────────── */
    const { data, isLoading, isError, refetch } = useFnbProducts(cinemaId);
    const products = data?.products ?? [];
    const productGroups = useMemo(() => groupProducts(products), [products]);

    /* ── Quantity handlers ────────────────────── */
    const updateQty = useCallback((itemId: number, delta: number) => {
        setFnbItems((prev) => {
            const next = new Map(prev);
            const cur  = next.get(itemId) ?? 0;
            const nxt  = cur + delta;
            if (nxt <= 0) next.delete(itemId);
            else          next.set(itemId, nxt);
            return next;
        });
    }, []);

    /* ── Totals ───────────────────────────────── */
    const seatsTotal = useMemo(
        () => (selectedSeats ?? []).reduce((s, seat) => s + (seat.price ?? 0), 0),
        [selectedSeats]
    );

    const fnbTotal = useMemo(() => {
        let total = 0;
        for (const [itemId, qty] of fnbItems.entries()) {
            const p = products.find((x) => x.itemID === itemId);
            if (p) total += p.price * qty;
        }
        return total;
    }, [fnbItems, products]);

    const grandTotal = seatsTotal + fnbTotal;

    /* ── F&B items list for summary ──────────── */
    const fnbSummaryItems = useMemo(() => {
        return Array.from(fnbItems.entries())
            .map(([itemId, qty]) => {
                const p = products.find((x) => x.itemID === itemId);
                return p ? { name: p.itemName, qty, subtotal: p.price * qty } : null;
            })
            .filter(Boolean) as { name: string; qty: number; subtotal: number }[];
    }, [fnbItems, products]);

    /* ── Navigation ───────────────────────────── */
    const buildPaymentState = (items: FnbItem[]): PaymentNavState => ({
        ...navState,
        fnbItems: items,
    });

    const handleContinue = useCallback(() => {
        const items = Array.from(fnbItems.entries()).map(([itemId, quantity]) => ({
            itemId,
            quantity,
        }));
        navigate("/customer/booking/payment", { state: buildPaymentState(items) });
    }, [navigate, navState, fnbItems]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Back to Seat Selection — navigate(-1) fires a native popstate event,
       which the app-level useSeatHoldBackGuard already listens for to
       release the current seat hold, same as pressing the browser Back
       button. Keeping this on that one shared mechanism avoids a second,
       divergent "release hold" code path. */
    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    /* ── Date format ──────────────────────────── */
    const showDateStr = useMemo(
        () => (startTime ? formatDateTime(startTime) : ""),
        [startTime]
    );

    if (!showtimeId) return null;

    /* ── Render ───────────────────────────────── */
    return (
        <div className="cgv-fnb-page">
            <div className="cgv-fnb-container">

                {/* ── Step indicator ── */}
                <div className="cgv-fnb-steps">
                    <button className="cgv-fnb-back-btn" onClick={handleBack} aria-label={t("fnb.backToSeats")}>
                        <BackIcon />
                    </button>
                    <div className="cgv-fnb-step cgv-fnb-step--done">
                        <span className="cgv-fnb-step__num">✓</span>
                        {t("fnb.stepSeats")}
                    </div>
                    <div className="cgv-fnb-step__sep" />
                    <div className="cgv-fnb-step cgv-fnb-step--active">
                        <span className="cgv-fnb-step__num">2</span>
                        {t("fnb.stepFnb")}
                    </div>
                    <div className="cgv-fnb-step__sep" />
                    <div className="cgv-fnb-step">
                        <span className="cgv-fnb-step__num">3</span>
                        {t("fnb.stepPayment")}
                    </div>
                </div>

                {/* ── Hold timer ── */}
                {holdExpiresAt && (
                    <div
                        className={`cgv-fnb-timer${isUrgent ? " cgv-fnb-timer--urgent" : ""}${isExpired ? " cgv-fnb-timer--expired" : ""}`}
                    >
                        <span className="cgv-fnb-timer__icon">⏱</span>
                        {isExpired ? (
                            <span style={{ color: "#ff6b6b", fontWeight: 600 }}>
                                {t("fnb.holdExpired")}
                            </span>
                        ) : (
                            <>
                                <span>{t("fnb.holdFor")}</span>
                                <span className="cgv-fnb-timer__count">
                                    {formatCountdown(timeLeft)}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* ── Main 2-col layout ── */}
                <div className="cgv-fnb-layout">

                    {/* ── Left: product list ── */}
                    <div className="cgv-fnb-left">
                        {isLoading ? (
                            <>
                                <SkeletonGrid />
                                <SkeletonGrid />
                            </>
                        ) : isError ? (
                            <div className="cgv-fnb-state">
                                <p className="cgv-fnb-state__title">{t("fnb.loadErrorTitle")}</p>
                                <p className="cgv-fnb-state__body">
                                    {t("fnb.loadErrorBody")}
                                </p>
                                <button className="cgv-fnb-retry-btn" onClick={() => refetch()}>
                                    {t("common:actions.tryAgain")}
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="cgv-fnb-state">
                                <p className="cgv-fnb-state__title">{t("fnb.emptyTitle")}</p>
                                <p className="cgv-fnb-state__body">
                                    {t("fnb.emptyBody")}
                                </p>
                            </div>
                        ) : (
                            productGroups.map(({ type, labelKey, items }) => (
                                <div key={type} className="cgv-fnb-group">
                                    <p className="cgv-fnb-group-title">{labelKey ? t(labelKey) : type.toUpperCase()}</p>
                                    <div className="cgv-fnb-grid">
                                        {items.map((product) => (
                                            <FnbProductCard
                                                key={product.itemID}
                                                product={product}
                                                quantity={fnbItems.get(product.itemID) ?? 0}
                                                onAdd={() => updateQty(product.itemID, 1)}
                                                onRemove={() => updateQty(product.itemID, -1)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── Right: summary sidebar ── */}
                    <aside className="cgv-fnb-right">
                        <div className="cgv-fnb-summary">
                            <p className="cgv-fnb-summary__title">{t("seats.orderSummary")}</p>

                            {/* Movie info */}
                            <div className="cgv-fnb-summary__movie">
                                {moviePoster ? (
                                    <img
                                        src={moviePoster}
                                        alt={movieTitle}
                                        className="cgv-fnb-summary__poster"
                                    />
                                ) : (
                                    <div className="cgv-fnb-summary__poster-ph"><FilmClapperIcon size={22} /></div>
                                )}
                                <div className="cgv-fnb-summary__movie-info">
                                    <p className="cgv-fnb-summary__movie-title">
                                        {movieTitle ?? "—"}
                                    </p>
                                    {cinemaName && (
                                        <p className="cgv-fnb-summary__movie-meta">
                                            {cinemaName}
                                            {roomName ? ` · ${roomName}` : ""}
                                        </p>
                                    )}
                                    {showDateStr && (
                                        <p className="cgv-fnb-summary__movie-meta">{showDateStr}</p>
                                    )}
                                </div>
                            </div>

                            {/* Seat list */}
                            {(selectedSeats ?? []).length > 0 && (
                                <div>
                                    <p className="cgv-fnb-summary__sec">{t("fnb.selectedSeats")}</p>
                                    <div className="cgv-fnb-summary__chips">
                                        {selectedSeats.map((s) => (
                                            <span key={s.seatId} className="cgv-fnb-summary__chip">
                                                {getSeatLabel(s)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* F&B list */}
                            <div>
                                <p className="cgv-fnb-summary__sec">{t("fnb.foodBeverage")}</p>
                                {fnbSummaryItems.length === 0 ? (
                                    <p className="cgv-fnb-summary__fnb-empty">{t("fnb.noItems")}</p>
                                ) : (
                                    fnbSummaryItems.map((item) => (
                                        <div
                                            key={item.name}
                                            className="cgv-fnb-summary__fnb-item"
                                        >
                                            <span className="cgv-fnb-summary__fnb-name">
                                                {item.qty}× {item.name}
                                            </span>
                                            <span className="cgv-fnb-summary__fnb-sub">
                                                {formatPrice(item.subtotal)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Price breakdown */}
                            <div>
                                <div className="cgv-fnb-summary__hr" />
                                <div className="cgv-fnb-summary__row" style={{ marginTop: 8 }}>
                                    <span className="cgv-fnb-summary__row-label">
                                        {t("fnb.seatsCount", { count: (seatIds ?? []).length })}
                                    </span>
                                    <span className="cgv-fnb-summary__row-val">
                                        {formatPrice(seatsTotal)}
                                    </span>
                                </div>
                                {fnbTotal > 0 && (
                                    <div className="cgv-fnb-summary__row" style={{ marginTop: 6 }}>
                                        <span className="cgv-fnb-summary__row-label">{t("fnb.fnbShort")}</span>
                                        <span className="cgv-fnb-summary__row-val">
                                            {formatPrice(fnbTotal)}
                                        </span>
                                    </div>
                                )}
                                <div className="cgv-fnb-summary__hr" style={{ marginTop: 10 }} />
                                <div className="cgv-fnb-summary__total" style={{ marginTop: 10 }}>
                                    <span className="cgv-fnb-summary__total-label">{t("fnb.estimatedTotal")}</span>
                                    <span className="cgv-fnb-summary__total-val">
                                        {formatPrice(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <button
                                className="cgv-fnb-continue-btn"
                                onClick={handleContinue}
                                disabled={isExpired}
                            >
                                {t("fnb.continueToPayment")}
                            </button>
                            <button className="cgv-fnb-back-link" onClick={handleBack}>
                                {t("fnb.backToSeats")}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── Mobile bottom bar ── */}
            <div className="cgv-fnb-mobile-bar" aria-live="polite">
                <div className="cgv-fnb-mobile-bar__info">
                    <span className="cgv-fnb-mobile-bar__label">
                        {fnbSummaryItems.length > 0
                            ? t("fnb.itemsCount", { count: fnbSummaryItems.reduce((s, i) => s + i.qty, 0) })
                            : t("fnb.noItems")}
                    </span>
                    <span className="cgv-fnb-mobile-bar__total">
                        {formatPrice(grandTotal)}
                    </span>
                </div>
                <div className="cgv-fnb-mobile-bar__btns">
                    <button className="cgv-fnb-mobile-bar__back" onClick={handleBack} aria-label={t("fnb.back")}>
                        <BackIcon />
                    </button>
                    <button
                        className="cgv-fnb-mobile-bar__continue"
                        onClick={handleContinue}
                        disabled={isExpired}
                    >
                        {t("seats.continue")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FnbPage;
