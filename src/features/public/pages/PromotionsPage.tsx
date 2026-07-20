import { type FC, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useVouchers } from "@/features/vouchers/hooks/useVouchers";
import type { Voucher } from "@/features/vouchers/types/voucher.types";
import { useAppSelector } from "@/store/hooks";
import { useMembershipInfo } from "@/features/customer/hooks/useMembership";
import RedeemConfirmModal from "@/features/customer/components/RedeemConfirmModal";
import type { RedeemableVoucherLike } from "@/features/customer/types/loyaltyVoucher.types";
import { normalizeText } from "@/utils/string";
import { useVoucherRuleLabels } from "../hooks/useVoucherRuleLabels";
import VoucherRuleChips from "../components/VoucherRuleChips";
import { StarPointsIcon, CheckCircleIcon, CopyIcon, ChevronRightIcon } from "@/components/ui/BrandIcons";
import "../promotions.css";

const HERO_AUTOPLAY_MS = 5000;

const EXPIRING_SOON_DAYS = 3;

/** Grid starts capped at 2 rows (2 cols × 3) and grows by the same amount
 *  each time "Load more" is pressed, instead of dumping every active
 *  voucher on the page at once. */
const GRID_PAGE_SIZE = 6;

const fmtDate = (iso: string) => (iso ? dayjs(iso.slice(0, 10)).format("DD/MM/YYYY") : "—");
const fmtPoints = (n: number) => n.toLocaleString("en-US");

const discountLabel = (v: Voucher) =>
    v.discountType === "percent"
        ? { value: `${v.discountValue}`, unit: "% OFF" }
        : { value: `${v.discountValue.toLocaleString("vi-VN")}₫`, unit: "OFF" };

/** Days remaining until validUntil (whole days, can be negative if past). */
const daysUntil = (iso: string): number | null => {
    if (!iso) return null;
    return dayjs(iso.slice(0, 10)).startOf("day").diff(dayjs().startOf("day"), "day");
};

const isExpiringSoon = (iso: string): boolean => {
    const d = daysUntil(iso);
    return d !== null && d >= 0 && d <= EXPIRING_SOON_DAYS;
};

/** % of maxUses already claimed — null when the voucher has no cap. */
const usagePercent = (v: Voucher): number | null => {
    if (!v.maxUses || v.maxUses <= 0) return null;
    return Math.min(100, Math.round((v.usedCount / v.maxUses) * 100));
};

/** The 3 newest active vouchers, most recently created first. */
const pickFeaturedVouchers = (vouchers: Voucher[]): Voucher[] =>
    [...vouchers]
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 3);

const useCopyCode = (code: string) => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return { copied, copy };
};

/** Code/copy affordance for a directly-usable public voucher. */
const VoucherCodeRow: FC<{ voucher: Voucher; compact?: boolean }> = ({ voucher, compact }) => {
    const { copied, copy } = useCopyCode(voucher.voucherCode);
    return (
        <div className={compact ? "promo-card__code-row" : "promo-featured__code-row"}>
            <div className={compact ? "promo-card__code" : "promo-featured__code"}>{voucher.voucherCode}</div>
            <button className={`promo-card__copy${copied ? " promo-card__copy--done" : ""}`} onClick={copy}>
                {copied ? <><CheckCircleIcon size={14} /> Copied</> : <><CopyIcon size={14} /> Copy</>}
            </button>
        </div>
    );
};

/** Redeem CTA for a loyalty (isRedeemable) voucher — never a copy button,
 *  since the code isn't usable until redeemed with points. */
const RedeemCta: FC<{
    voucher: Voucher;
    isLoggedIn: boolean;
    onRedeem: (voucher: Voucher) => void;
}> = ({ voucher, isLoggedIn, onRedeem }) => (
    <div className="promo-card__redeem-row">
        <span className="promo-card__redeem-badge">
            <StarPointsIcon size={13} /> Redeem with points
        </span>
        {isLoggedIn ? (
            <button className="promo-card__redeem-btn" onClick={() => onRedeem(voucher)}>
                Redeem for {fmtPoints(voucher.requiredPoints ?? 0)} pts
            </button>
        ) : (
            <Link to="/login" className="promo-card__redeem-btn promo-card__redeem-btn--login">
                Log in to redeem
            </Link>
        )}
    </div>
);

/* ── Hero — up to 3 newest vouchers, side by side ── */
const FeaturedCard: FC<{
    voucher: Voucher;
    isLoggedIn: boolean;
    onRedeem: (voucher: Voucher) => void;
}> = ({ voucher, isLoggedIn, onRedeem }) => {
    const d = discountLabel(voucher);
    const pct = usagePercent(voucher);
    const expiring = isExpiringSoon(voucher.validUntil);

    return (
        <div
            className={`promo-featured${voucher.imageUrl ? "" : " promo-featured--empty"}`}
            style={voucher.imageUrl ? { backgroundImage: `url(${voucher.imageUrl})` } : undefined}
        >
            <div className="promo-featured__scrim" />
            <div className="promo-featured__content">
                <span className="promo-featured__eyebrow">Featured</span>
                <div className="promo-featured__discount">
                    {d.value}<span>{d.unit}</span>
                </div>
                <p className="promo-featured__desc">{voucher.description || "Special promotion."}</p>

                <div className="promo-featured__meta">
                    {voucher.minOrderValue > 0 && <span>Min order: {voucher.minOrderValue.toLocaleString("vi-VN")}₫</span>}
                    <span className={expiring ? "promo-featured__expiring" : ""}>
                        Valid until {fmtDate(voucher.validUntil)}
                    </span>
                </div>

                {pct !== null && (
                    <div className="promo-featured__progress" aria-label={`${pct}% claimed`}>
                        <div className="promo-featured__progress-bar" style={{ width: `${pct}%` }} />
                        <span>{voucher.usedCount}/{voucher.maxUses} claimed</span>
                    </div>
                )}

                {voucher.isRedeemable ? (
                    <RedeemCta voucher={voucher} isLoggedIn={isLoggedIn} onRedeem={onRedeem} />
                ) : (
                    <VoucherCodeRow voucher={voucher} />
                )}
            </div>
        </div>
    );
};

/** Single-slide hero carousel through the newest active vouchers — click
 *  arrows/dots to navigate, auto-advances every 5s, pauses on hover. */
const HeroCarousel: FC<{
    vouchers: Voucher[];
    isLoggedIn: boolean;
    onRedeem: (voucher: Voucher) => void;
}> = ({ vouchers, isLoggedIn, onRedeem }) => {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const count = vouchers.length;

    // Reset to the first slide whenever the underlying voucher set changes
    // (e.g. after a refetch), so a stale out-of-range index can't linger.
    // Adjust-during-render (not an effect) so this doesn't cascade an extra render.
    const [syncedCount, setSyncedCount] = useState(count);
    if (count !== syncedCount) {
        setSyncedCount(count);
        setIndex(0);
    }

    useEffect(() => {
        if (count <= 1 || paused) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % count), HERO_AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [count, paused]);

    if (count === 0) return null;
    const voucher = vouchers[index];

    return (
        <div
            className="promo-hero"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <FeaturedCard voucher={voucher} isLoggedIn={isLoggedIn} onRedeem={onRedeem} />

            {count > 1 && (
                <>
                    <button
                        type="button"
                        className="promo-hero__nav promo-hero__nav--prev"
                        onClick={() => setIndex((i) => (i - 1 + count) % count)}
                        aria-label="Previous promotion"
                    >
                        <ChevronRightIcon size={20} />
                    </button>
                    <button
                        type="button"
                        className="promo-hero__nav promo-hero__nav--next"
                        onClick={() => setIndex((i) => (i + 1) % count)}
                        aria-label="Next promotion"
                    >
                        <ChevronRightIcon size={20} />
                    </button>

                    <div className="promo-hero__dots">
                        {vouchers.map((v, i) => (
                            <button
                                key={v.voucherId}
                                type="button"
                                className={`promo-hero__dot${i === index ? " promo-hero__dot--active" : ""}`}
                                onClick={() => setIndex(i)}
                                aria-label={`Go to promotion ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ── Grid card ── */
const PromoCard: FC<{
    voucher: Voucher;
    labels: ReturnType<typeof useVoucherRuleLabels>;
    isLoggedIn: boolean;
    onRedeem: (voucher: Voucher) => void;
}> = ({ voucher, labels, isLoggedIn, onRedeem }) => {
    const d = discountLabel(voucher);
    const pct = usagePercent(voucher);
    const expiring = isExpiringSoon(voucher.validUntil);

    return (
        <div className="promo-card">
            <div
                className={`promo-card__banner${voucher.imageUrl ? "" : " promo-card__banner--empty"}`}
                style={voucher.imageUrl ? { backgroundImage: `url(${voucher.imageUrl})` } : undefined}
            >
                <div className="promo-card__discount">
                    {d.value}<span>{d.unit}</span>
                </div>
            </div>
            <div className="promo-card__body">
                {(voucher.category || expiring) && (
                    <div className="promo-card__tags">
                        {voucher.category && <span className="promo-card__category">{voucher.category}</span>}
                        {expiring && <span className="promo-card__expiring-badge">Expires soon</span>}
                    </div>
                )}
                <p className="promo-card__desc">{voucher.description || "Special promotion."}</p>
                <div className="promo-card__meta">
                    {voucher.minOrderValue > 0 && (
                        <span>Min order: {voucher.minOrderValue.toLocaleString("vi-VN")}₫</span>
                    )}
                    <span className={expiring ? "promo-card__meta-expiring" : ""}>Valid until {fmtDate(voucher.validUntil)}</span>
                </div>

                <VoucherRuleChips rules={voucher.rules} labels={labels} />

                {pct !== null && (
                    <div className="promo-card__progress" aria-label={`${pct}% claimed`}>
                        <div className="promo-card__progress-track">
                            <div className="promo-card__progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <span>{voucher.usedCount}/{voucher.maxUses} claimed</span>
                    </div>
                )}

                {voucher.isRedeemable ? (
                    <RedeemCta voucher={voucher} isLoggedIn={isLoggedIn} onRedeem={onRedeem} />
                ) : (
                    <VoucherCodeRow voucher={voucher} compact />
                )}
            </div>
        </div>
    );
};

const PromotionsPage: FC = () => {
    const { data, isLoading } = useVouchers({ pageIndex: 1, pageSize: 100 });
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [visibleCount, setVisibleCount] = useState(GRID_PAGE_SIZE);
    const [redeemTarget, setRedeemTarget] = useState<RedeemableVoucherLike | null>(null);

    const isLoggedIn = useAppSelector((s) => s.auth.user != null);
    const { data: membership } = useMembershipInfo(isLoggedIn);
    const totalPoints = membership?.totalPoints ?? 0;

    const activeVouchers = useMemo(() => {
        const now = dayjs();
        return (data?.items ?? []).filter(
            (v) => v.isActive && (!v.validUntil || dayjs(v.validUntil).isAfter(now)),
        );
    }, [data]);

    const featuredVouchers = useMemo(() => pickFeaturedVouchers(activeVouchers), [activeVouchers]);
    const ruleLabels = useVoucherRuleLabels(activeVouchers);

    const categories = useMemo(() => {
        const set = new Set(activeVouchers.map((v) => v.category).filter(Boolean));
        return Array.from(set).sort();
    }, [activeVouchers]);

    // The grid shows the full active list — including whatever's in the hero
    // above — rather than excluding featured vouchers from it.
    const filtered = useMemo(() => {
        const q = normalizeText(search);
        return activeVouchers.filter((v) => {
            if (category && v.category !== category) return false;
            if (q && !normalizeText(`${v.voucherCode} ${v.description}`).includes(q)) return false;
            return true;
        });
    }, [activeVouchers, category, search]);

    // Reset the reveal count whenever the filtered set changes, so a stale
    // count from a previous search/category doesn't leave the grid over- or
    // under-expanded relative to what's now available.
    useEffect(() => {
        setVisibleCount(GRID_PAGE_SIZE);
    }, [category, search]);

    const visibleVouchers = filtered.slice(0, visibleCount);

    const handleRedeem = (voucher: Voucher) => {
        if (voucher.requiredPoints == null) return;
        setRedeemTarget({
            voucherId: voucher.voucherId,
            voucherCode: voucher.voucherCode,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            requiredPoints: voucher.requiredPoints,
        });
    };

    return (
        <div className="promo-page">
            <div className="promo-head">
                <span className="promo-head__eyebrow">CV Premium</span>
                <h1 className="promo-head__title">Promotions &amp; Offers</h1>
                <p className="promo-head__sub">Exclusive deals to make every visit more rewarding.</p>
            </div>

            {isLoading ? (
                <>
                    <div className="promo-skel promo-skel--featured" />
                    <div className="promo-grid">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="promo-skel" />)}
                    </div>
                </>
            ) : activeVouchers.length === 0 ? (
                <div className="promo-empty">
                    <p style={{ margin: 0, fontSize: 16 }}>No active promotions right now.</p>
                    <p style={{ margin: "6px 0 0", fontSize: 14 }}>Check back soon for exclusive offers.</p>
                </div>
            ) : (
                <>
                    {featuredVouchers.length > 0 && (
                        <HeroCarousel vouchers={featuredVouchers} isLoggedIn={isLoggedIn} onRedeem={handleRedeem} />
                    )}

                    <div className="promo-toolbar">
                        <div className="promo-search">
                            <input
                                type="text"
                                placeholder="Search by code or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {categories.length > 0 && (
                            <div className="promo-tabs" role="tablist" aria-label="Filter by category">
                                <button
                                    role="tab"
                                    aria-selected={category === ""}
                                    className={`promo-tab${category === "" ? " promo-tab--active" : ""}`}
                                    onClick={() => setCategory("")}
                                >
                                    All
                                </button>
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        role="tab"
                                        aria-selected={category === c}
                                        className={`promo-tab${category === c ? " promo-tab--active" : ""}`}
                                        onClick={() => setCategory(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="promo-empty">
                            <p style={{ margin: 0, fontSize: 16 }}>No promotions match your search.</p>
                        </div>
                    ) : (
                        <>
                            <div className="promo-grid">
                                {visibleVouchers.map((v) => (
                                    <PromoCard
                                        key={v.voucherId}
                                        voucher={v}
                                        labels={ruleLabels}
                                        isLoggedIn={isLoggedIn}
                                        onRedeem={handleRedeem}
                                    />
                                ))}
                            </div>

                            {visibleCount < filtered.length && (
                                <div className="promo-load-more">
                                    <button
                                        type="button"
                                        className="promo-load-more__btn"
                                        onClick={() => setVisibleCount((c) => c + GRID_PAGE_SIZE)}
                                    >
                                        Load more ({filtered.length - visibleCount} more)
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <RedeemConfirmModal
                voucher={redeemTarget}
                totalPoints={totalPoints}
                onClose={() => setRedeemTarget(null)}
                onRedeemed={() => setRedeemTarget(null)}
            />
        </div>
    );
};

export default PromotionsPage;
