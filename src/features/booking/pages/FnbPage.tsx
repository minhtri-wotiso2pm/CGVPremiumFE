import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { FnbItem, FnbNavState,  Product } from "../types/fnb.types";
import { useFnbProducts } from "../hooks/useFnbProducts";
import { setActiveSeatHold } from "../utils/activeSeatHold";
import { formatPrice, getSeatLabel } from "../utils/seat.utils";
import FnbProductCard from "../components/FnbProductCard";
import "../components/fnb.css";


const GROUP_LABELS: Record<string, string> = {
    combo: "COMBO",
    snack: "ĐỒ ĂN NHẸ",
    food: "ĐỒ ĂN",
    drink: "ĐỒ UỐNG",
    beverage: "ĐỒ UỐNG",
};

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
    return Array.from(map.entries()).map(([type, items]) => ({
        type,
        label: GROUP_LABELS[type] ?? type.toUpperCase(),
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
   const navigate = useNavigate();
const location = useLocation();

const navState = (location.state ?? {}) as FnbNavState;

const paymentPath = location.pathname.startsWith("/staff")
    ? "/staff/counter-payment"
    : "/customer/booking/payment";
    
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

    /* ── Redirect nếu không có state hợp lệ ── */
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
    const isUrgent = timeLeft > 0 && timeLeft < 2 * 60_000;

    console.log(navState);

    /* ── Products ─────────────────────────────── */
   const { data, isLoading, isError, refetch } = useFnbProducts(cinemaId);

console.log({
    cinemaId,
    isLoading,
    isError,
    data,
});
   const products = useMemo(() => data?.products ?? [], [data]);
   const productGroups = useMemo(() => {
    return groupProducts(data?.products ?? []);
}, [data]);
console.log("data", data);
console.log("products", products);
console.log("productGroups", productGroups);

    /* ── Quantity handlers ────────────────────── */
    const updateQty = useCallback((itemId: number, delta: number) => {
        setFnbItems((prev) => {
            const next = new Map(prev);
            const cur = next.get(itemId) ?? 0;
            const nxt = cur + delta;
            if (nxt <= 0) next.delete(itemId);
            else next.set(itemId, nxt);
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
    
    // =========================
// Calculate totals
// =========================
const seatTotal = selectedSeats.reduce(
    (sum, seat) => sum + (seat.price ?? 0),
    0
);



// =========================
// Build payment state
// =========================
console.log("holdIds:", navState.holdIds);
console.log("holdExpiresAt:", navState.holdExpiresAt);
const buildPaymentState = (items: FnbItem[]) => ({
    ...navState,

    showtimeId,
    seatIds,

    selectedSeats,
    fnbItems: items,

    seatTotal,
    fnbTotal,
    holdIds: navState.holdIds,
    holdExpiresAt: navState.holdExpiresAt,
});
// =========================
// Continue
// =========================
const handleContinue = useCallback(() => {
    const items = products
        // Lọc bằng thuộc tính itemID tương thích với State Map
        .filter((p) => (fnbItems.get(p.itemID) ?? 0) > 0)
        .map((p) => ({
            // Nếu PaymentNavState yêu cầu key là 'productId', hãy giữ nguyên việc map key
            productId: p.productId ?? p.itemID, 
            productName: p.itemName ?? p.productName, // Kiểm tra lại itemName ở fnbSummaryItems bạn dùng p.itemName
            price: p.price,
            quantity: fnbItems.get(p.itemID)!, // Lấy số lượng bằng itemID
        }));

    navigate(paymentPath, {
        state: buildPaymentState(items),
    });
}, [
    navigate,
    paymentPath,
    products,
    fnbItems,
    seatTotal,
    fnbTotal,
    selectedSeats,
    navState,
]);
// =========================
// Skip F&B
// =========================
const handleSkip = useCallback(() => {
    navigate(paymentPath, {
        state: buildPaymentState([]),
    });
}, [
    navigate,
    paymentPath,
    seatTotal,
    fnbTotal,
    selectedSeats,
    navState,
]);
    /* ── Date format ──────────────────────────── */
    const showDateStr = useMemo(() => {
        if (!startTime) return "";
        try {
            return new Date(startTime).toLocaleString("vi-VN", {
                weekday: "short", day: "2-digit", month: "2-digit",
                hour: "2-digit", minute: "2-digit",
            });
        } catch { return startTime; }
    }, [startTime]);

    if (!showtimeId) return null;

    /* ── Render ───────────────────────────────── */
    return (
        <div className="cgv-fnb-page">
            <div className="cgv-fnb-container">

                {/* ── Step indicator ── */}
                <div className="cgv-fnb-steps">
                    <div className="cgv-fnb-step cgv-fnb-step--done">
                        <span className="cgv-fnb-step__num">✓</span>
                        Chọn ghế
                    </div>
                    <div className="cgv-fnb-step__sep" />
                    <div className="cgv-fnb-step cgv-fnb-step--active">
                        <span className="cgv-fnb-step__num">2</span>
                        Đồ ăn & Thức uống
                    </div>
                    <div className="cgv-fnb-step__sep" />
                    <div className="cgv-fnb-step">
                        <span className="cgv-fnb-step__num">3</span>
                        Thanh toán
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
                                Ghế đã hết hạn giữ — vui lòng quay lại chọn ghế
                            </span>
                        ) : (
                            <>
                                <span>Ghế của bạn được giữ trong</span>
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
                                <p className="cgv-fnb-state__title">Không tải được sản phẩm</p>
                                <p className="cgv-fnb-state__body">
                                    Vui lòng kiểm tra kết nối và thử lại.
                                </p>
                                <button className="cgv-fnb-retry-btn" onClick={() => refetch()}>
                                    Thử lại
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="cgv-fnb-state">
                                <p className="cgv-fnb-state__title">Chưa có sản phẩm</p>
                                <p className="cgv-fnb-state__body">
                                    Rạp hiện chưa có đồ ăn thức uống. Bạn có thể bỏ qua bước này.
                                </p>
                            </div>
                        ) : (
                            productGroups.map(({ type, label, items }) => (
                                <div key={type} className="cgv-fnb-group">
                                    <p className="cgv-fnb-group-title">{label}</p>
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
                            <p className="cgv-fnb-summary__title">Tóm tắt đơn hàng</p>

                            {/* Movie info */}
                            <div className="cgv-fnb-summary__movie">
                                {moviePoster ? (
                                    <img
                                        src={moviePoster}
                                        alt={movieTitle}
                                        className="cgv-fnb-summary__poster"
                                    />
                                ) : (
                                    <div className="cgv-fnb-summary__poster-ph">🎬</div>
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
                                    <p className="cgv-fnb-summary__sec">Ghế đã chọn</p>
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
                                <p className="cgv-fnb-summary__sec">Đồ ăn & Thức uống</p>
                                {fnbSummaryItems.length === 0 ? (
                                    <p className="cgv-fnb-summary__fnb-empty">Chưa chọn món</p>
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
                                        Ghế ({(seatIds ?? []).length})
                                    </span>
                                    <span className="cgv-fnb-summary__row-val">
                                        {formatPrice(seatsTotal)}
                                    </span>
                                </div>
                                {fnbTotal > 0 && (
                                    <div className="cgv-fnb-summary__row" style={{ marginTop: 6 }}>
                                        <span className="cgv-fnb-summary__row-label">F&B</span>
                                        <span className="cgv-fnb-summary__row-val">
                                            {formatPrice(fnbTotal)}
                                        </span>
                                    </div>
                                )}
                                <div className="cgv-fnb-summary__hr" style={{ marginTop: 10 }} />
                                <div className="cgv-fnb-summary__total" style={{ marginTop: 10 }}>
                                    <span className="cgv-fnb-summary__total-label">Tạm tính</span>
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
                                Tiếp tục thanh toán
                            </button>
                            <button className="cgv-fnb-skip-btn" onClick={handleSkip}>
                                Bỏ qua — không chọn F&amp;B
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
                            ? `${fnbSummaryItems.reduce((s, i) => s + i.qty, 0)} món`
                            : "Chưa chọn món"}
                    </span>
                    <span className="cgv-fnb-mobile-bar__total">
                        {formatPrice(grandTotal)}
                    </span>
                </div>
                <div className="cgv-fnb-mobile-bar__btns">
                    <button className="cgv-fnb-mobile-bar__skip" onClick={handleSkip}>
                        Bỏ qua
                    </button>
                    <button
                        className="cgv-fnb-mobile-bar__continue"
                        onClick={handleContinue}
                        disabled={isExpired}
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FnbPage;
