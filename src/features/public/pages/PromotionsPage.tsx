import { type FC, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useVouchers } from "@/features/vouchers/hooks/useVouchers";
import type { Voucher } from "@/features/vouchers/types/voucher.types";
import { normalizeText } from "@/utils/string";
import "../promotions.css";

const EXPIRING_SOON_DAYS = 3;

const fmtDate = (iso: string) => (iso ? dayjs(iso.slice(0, 10)).format("DD/MM/YYYY") : "—");

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

/** The single most compelling active voucher: highest discount (percent
 *  deals take priority over fixed-amount ones, since a flat number isn't
 *  comparable to a percentage), tie-broken by whichever expires soonest. */
const pickFeatured = (vouchers: Voucher[]): Voucher | null => {
    if (vouchers.length === 0) return null;
    const percents = vouchers.filter((v) => v.discountType === "percent");
    const pool = percents.length > 0 ? percents : vouchers;
    return [...pool].sort((a, b) => {
        if (b.discountValue !== a.discountValue) return b.discountValue - a.discountValue;
        return dayjs(a.validUntil).valueOf() - dayjs(b.validUntil).valueOf();
    })[0];
};

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

/* ── Featured banner — the single standout deal, full-width ── */
const FeaturedPromo: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const { copied, copy } = useCopyCode(voucher.voucherCode);
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
                <span className="promo-featured__eyebrow">🔥 Best Deal</span>
                <div className="promo-featured__discount">
                    {d.value}<span>{d.unit}</span>
                </div>
                <p className="promo-featured__desc">{voucher.description || "Special promotion — apply this code at checkout."}</p>

                <div className="promo-featured__meta">
                    {voucher.minOrderValue > 0 && <span>Min order: {voucher.minOrderValue.toLocaleString("vi-VN")}₫</span>}
                    <span className={expiring ? "promo-featured__expiring" : ""}>
                        {expiring ? "" : ""}Valid until {fmtDate(voucher.validUntil)}
                    </span>
                </div>

                {pct !== null && (
                    <div className="promo-featured__progress" aria-label={`${pct}% claimed`}>
                        <div className="promo-featured__progress-bar" style={{ width: `${pct}%` }} />
                        <span>{voucher.usedCount}/{voucher.maxUses} claimed</span>
                    </div>
                )}

                <div className="promo-featured__code-row">
                    <div className="promo-featured__code">{voucher.voucherCode}</div>
                    <button
                        className={`promo-card__copy${copied ? " promo-card__copy--done" : ""}`}
                        onClick={copy}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Grid card ── */
const PromoCard: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const { copied, copy } = useCopyCode(voucher.voucherCode);
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
                <p className="promo-card__desc">{voucher.description || "Special promotion — apply this code at checkout."}</p>
                <div className="promo-card__meta">
                    {voucher.minOrderValue > 0 && (
                        <span>Min order: {voucher.minOrderValue.toLocaleString("vi-VN")}₫</span>
                    )}
                    <span className={expiring ? "promo-card__meta-expiring" : ""}>Valid until {fmtDate(voucher.validUntil)}</span>
                </div>

                {pct !== null && (
                    <div className="promo-card__progress" aria-label={`${pct}% claimed`}>
                        <div className="promo-card__progress-track">
                            <div className="promo-card__progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <span>{voucher.usedCount}/{voucher.maxUses} claimed</span>
                    </div>
                )}

                <div className="promo-card__code-row">
                    <div className="promo-card__code">{voucher.voucherCode}</div>
                    <button
                        className={`promo-card__copy${copied ? " promo-card__copy--done" : ""}`}
                        onClick={copy}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PromotionsPage: FC = () => {
    const { data, isLoading } = useVouchers({ pageIndex: 1, pageSize: 100 });
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const activeVouchers = useMemo(() => {
        const now = dayjs();
        return (data?.items ?? []).filter(
            (v) => v.isActive && (!v.validUntil || dayjs(v.validUntil).isAfter(now)),
        );
    }, [data]);

    const featured = useMemo(() => pickFeatured(activeVouchers), [activeVouchers]);

    const categories = useMemo(() => {
        const set = new Set(activeVouchers.map((v) => v.category).filter(Boolean));
        return Array.from(set).sort();
    }, [activeVouchers]);

    const filtered = useMemo(() => {
        const q = normalizeText(search);
        return activeVouchers.filter((v) => {
            if (featured && v.voucherId === featured.voucherId) return false;
            if (category && v.category !== category) return false;
            if (q && !normalizeText(`${v.voucherCode} ${v.description}`).includes(q)) return false;
            return true;
        });
    }, [activeVouchers, featured, category, search]);

    return (
        <div className="promo-page">
            <div className="promo-head">
                <span className="promo-head__eyebrow">CGV Premium</span>
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
                    {featured && <FeaturedPromo voucher={featured} />}

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
                        <div className="promo-grid">
                            {filtered.map((v) => <PromoCard key={v.voucherId} voucher={v} />)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PromotionsPage;
