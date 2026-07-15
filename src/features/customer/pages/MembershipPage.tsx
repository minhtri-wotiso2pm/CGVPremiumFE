import type { FC } from "react";
import { Skeleton } from "antd";
import type { MembershipInfo, MembershipTier, PointsHistoryEntry } from "../types/membership.types";
import { useMembershipInfo, useMembershipTiers, usePointsHistory } from "../hooks/useMembership";
import { useProfile } from "../hooks/useProfile";
import { formatTierName, getTierColor } from "../utils/profile.mapper";
import styles from "./MembershipPage.module.css";

/* ─────────────────────────────────────────
   Custom SVG tier icons
───────────────────────────────────────── */
const SilverIcon: FC<{ size?: number }> = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.6" />
    </svg>
);

const GoldIcon: FC<{ size?: number }> = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
            fill="currentColor" fillOpacity="0.2"
        />
    </svg>
);

const PlatinumIcon: FC<{ size?: number }> = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
            fill="currentColor" fillOpacity="0.15"
        />
        <path d="M12 2L22 8.5M12 2L2 8.5M12 22L22 15.5M12 22L2 15.5M2 8.5L22 8.5"
            stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"
        />
    </svg>
);

const MegaVIPIcon: FC<{ size?: number }> = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M3 18L5.5 7L9.5 12L12 4L14.5 12L18.5 7L21 18H3Z"
            stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
            fill="currentColor" fillOpacity="0.2"
        />
        <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="5.5" cy="7" r="1.5" fill="currentColor" />
        <circle cx="12" cy="4" r="1.5" fill="currentColor" />
        <circle cx="18.5" cy="7" r="1.5" fill="currentColor" />
    </svg>
);

const CheckIcon: FC<{ size?: number }> = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LockIcon: FC<{ size?: number }> = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const EarnIcon: FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RedeemIcon: FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EmptyHistoryIcon: FC = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
        <path d="M15 16h18M15 22h12M15 28h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.2" />
        <circle cx="34" cy="34" r="8" fill="rgba(232,0,28,0.08)" stroke="#E8001C" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M34 30v4.5M34 37v.5" stroke="#E8001C" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
);

const ErrorIcon: FC = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
        <path d="M20 12v10M20 26v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
);

/* ─────────────────────────────────────────
   Tier config & helpers
───────────────────────────────────────── */
type TierKey = "silver" | "gold" | "platinum" | "megavip";

const TIER_ICONS: Record<TierKey, FC<{ size?: number }>> = {
    silver:   SilverIcon,
    gold:     GoldIcon,
    platinum: PlatinumIcon,
    megavip:  MegaVIPIcon,
};

const TIER_BG: Record<TierKey, string> = {
    silver:   "rgba(148,163,184,0.12)",
    gold:     "rgba(245,158,11,0.12)",
    platinum: "rgba(167,139,250,0.12)",
    megavip:  "rgba(232,0,28,0.12)",
};

const getTierCfg = (name: string) => {
    const key = (name?.toLowerCase() ?? "silver") as TierKey;
    return {
        color: getTierColor(name),
        bg: TIER_BG[key] ?? TIER_BG.silver,
        Icon: TIER_ICONS[key] ?? SilverIcon,
    };
};

const fmtPoints = (n: number) => n.toLocaleString("en-US");

const fmtCurrency = (n: number) =>
    n === 0
        ? "0 ₫"
        : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/* ─────────────────────────────────────────
   HeroCard
───────────────────────────────────────── */
const HeroCard: FC<{ info: MembershipInfo; refundsRemaining: number | null; totalRefunds: number | null }> = ({
    info, refundsRemaining, totalRefunds,
}) => {
    const cfg = getTierCfg(info.currentTier);
    const { Icon } = cfg;
    const isMax = !info.nextTier;

    const progressPct = isMax
        ? 100
        : info.pointsToNextTier != null
        ? Math.max(0, Math.min(100,
              (info.totalPoints / (info.totalPoints + info.pointsToNextTier)) * 100
          ))
        : 0;

    const nextCfg = info.nextTier ? getTierCfg(info.nextTier) : null;

    return (
        <div className={`${styles.card} ${styles.hero}`}>
            <div className={styles.heroGlow} style={{ background: cfg.color }} />

            <div className={styles.heroBody}>
                {/* Identity row — icon, tier name, discount chip: a single
                    compact inline cluster, never competing for space with
                    the stat row below it. */}
                <div className={styles.identityRow}>
                    <div
                        className={styles.tierIconWrap}
                        style={{ background: cfg.bg, borderColor: `${cfg.color}44`, color: cfg.color }}
                    >
                        <Icon size={26} />
                    </div>
                    <div className={styles.tierMeta}>
                        <span className={styles.tierEyebrow}>Membership Tier</span>
                        <div className={styles.tierNameRow}>
                            <span className={styles.tierName} style={{ color: cfg.color }}>
                                {formatTierName(info.currentTier)}
                            </span>
                            <span
                                className={styles.discountChip}
                                style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, color: cfg.color }}
                            >
                                {info.discountPercent > 0
                                    ? `${info.discountPercent}% discount per ticket`
                                    : "No discount yet"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats — a full-width row so every card divides the same
                    total width evenly, instead of a floating box leaving
                    dead space beside it. */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCell}>
                        <span className={styles.statValue} style={{ color: cfg.color }}>
                            {fmtPoints(info.totalPoints)}
                        </span>
                        <span className={styles.statLabel}>Total Points</span>
                    </div>
                    <div className={styles.statCell}>
                        <span className={styles.statValue}>{fmtCurrency(info.totalSpent)}</span>
                        <span className={styles.statLabel}>Total Spent</span>
                    </div>
                    <div className={styles.statCell}>
                        <span
                            className={styles.statValue}
                            style={{ color: info.discountPercent > 0 ? "#4ADE80" : "#f0e8e8" }}
                        >
                            {info.discountPercent}%
                        </span>
                        <span className={styles.statLabel}>Discount</span>
                    </div>
                    {refundsRemaining != null && totalRefunds != null && (
                        <div className={styles.statCell}>
                            <span className={styles.statValue} style={{ color: cfg.color }}>
                                {refundsRemaining} / {totalRefunds}
                            </span>
                            <span className={styles.statLabel}>Refunds Remaining</span>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className={styles.progressSection}>
                    {isMax ? (
                        <p className={styles.maxTierText}>
                            You have reached the highest tier —{" "}
                            <strong style={{ color: cfg.color }}>MegaVIP</strong>
                        </p>
                    ) : (
                        <>
                            <div className={styles.progressHeader}>
                                <span className={styles.progressLabel}>
                                    Progress to{" "}
                                    <strong className={styles.progressBold} style={{ color: nextCfg?.color }}>
                                        {formatTierName(info.nextTier!)}
                                    </strong>
                                </span>
                                <span className={styles.progressCount}>
                                    {fmtPoints(info.totalPoints)}{" / "}
                                    {fmtPoints(info.totalPoints + (info.pointsToNextTier ?? 0))} pts
                                </span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${progressPct}%`,
                                        background: `linear-gradient(90deg, ${cfg.color}99, ${nextCfg?.color ?? cfg.color})`,
                                    }}
                                />
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#5a4040" }}>
                                <strong style={{ color: "#f0e8e8" }}>
                                    {fmtPoints(info.pointsToNextTier ?? 0)}
                                </strong>{" "}
                                more points needed
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   TierRoadmap
───────────────────────────────────────── */
const TierRoadmap: FC<{ info: MembershipInfo; tiers: MembershipTier[] }> = ({ info, tiers }) => {
    const sorted = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
    const currentIdx = sorted.findIndex(
        (t) => t.tierName.toLowerCase() === info.currentTier.toLowerCase()
    );
    const segments = sorted.length - 1;

    const currentTierMinPts = sorted[currentIdx]?.minPoints ?? 0;
    const nextTierMinPts = sorted[currentIdx + 1]?.minPoints ?? 0;
    const withinSegment =
        nextTierMinPts > currentTierMinPts
            ? (info.totalPoints - currentTierMinPts) / (nextTierMinPts - currentTierMinPts)
            : 1;

    const fillPct =
        currentIdx >= sorted.length - 1
            ? 100
            : ((currentIdx + Math.min(1, Math.max(0, withinSegment))) / segments) * 100;

    const gradColors = sorted.map((t) => getTierCfg(t.tierName).color).join(", ");

    return (
        <div className={`${styles.card} ${styles.roadmapSection}`}>
            <p className={styles.sectionTitle}>Membership Journey</p>

            <div className={styles.roadmapWrap}>
                <div className={styles.roadmapTrack}>
                    <div
                        className={styles.roadmapFill}
                        style={{
                            width: `${fillPct}%`,
                            background: `linear-gradient(90deg, ${gradColors})`,
                        }}
                    />
                </div>

                {sorted.map((tier, idx) => {
                    const cfg = getTierCfg(tier.tierName);
                    const { Icon } = cfg;
                    const isDone = idx < currentIdx;
                    const isActive = idx === currentIdx;
                    const isLocked = idx > currentIdx;

                    return (
                        <div key={tier.tierID} className={styles.tierStep}>
                            <div
                                className={[
                                    styles.tierCircle,
                                    isActive ? styles.tierCircleActive : "",
                                    isLocked ? styles.tierCircleLocked : "",
                                ].join(" ")}
                                style={{
                                    borderColor: isLocked ? "rgba(255,255,255,0.08)" : cfg.color,
                                    background: isActive ? cfg.bg : "rgba(14,3,3,0.97)",
                                    boxShadow: isActive ? `0 0 0 3px ${cfg.color}33` : undefined,
                                    color: isLocked ? "rgba(255,255,255,0.15)" : cfg.color,
                                }}
                            >
                                {isDone
                                    ? <CheckIcon size={16} />
                                    : isLocked
                                    ? <LockIcon size={14} />
                                    : <Icon size={18} />
                                }
                            </div>

                            <span
                                className={styles.tierStepName}
                                style={{ color: isActive ? cfg.color : isLocked ? "#3a2020" : `${cfg.color}aa` }}
                            >
                                {formatTierName(tier.tierName)}
                            </span>

                            <span className={styles.tierStepPoints}>
                                {tier.minPoints === 0 ? "Default" : `${fmtPoints(tier.minPoints)} pts`}
                            </span>

                            <span
                                className={styles.tierStepRate}
                                style={{
                                    background: isLocked ? "rgba(255,255,255,0.02)" : cfg.bg,
                                    color: isLocked ? "#3a2020" : cfg.color,
                                    border: `1px solid ${isLocked ? "rgba(255,255,255,0.04)" : `${cfg.color}33`}`,
                                }}
                            >
                                {tier.discountRate === 0 ? "—" : `-${tier.discountRate * 100}%`}
                            </span>

                            <span className={styles.tierStepPoints}>
                                {tier.total_refunds} refund{tier.total_refunds !== 1 ? "s" : ""}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   PointsHistory
───────────────────────────────────────── */
const HistoryRow: FC<{ entry: PointsHistoryEntry }> = ({ entry }) => {
    const isEarn = entry.transactionType === "earn";
    const color = isEarn ? "#4ADE80" : "#F87171";
    const sign = isEarn ? "+" : "−";

    return (
        <div className={styles.historyRow}>
            <div
                className={styles.historyTypeBadge}
                style={{ background: isEarn ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", color }}
            >
                {isEarn ? <EarnIcon /> : <RedeemIcon />}
            </div>

            <div className={styles.historyInfo}>
                <p className={styles.historyDesc}>{entry.description}</p>
                <p className={styles.historyDate}>
                    {fmtDate(entry.createdAt)} · {fmtTime(entry.createdAt)}
                </p>
            </div>

            <span className={styles.historyPoints} style={{ color }}>
                {sign}{fmtPoints(Math.abs(entry.pointsDelta))} pts
            </span>
        </div>
    );
};

const PointsHistory: FC<{ items: PointsHistoryEntry[] }> = ({ items }) => (
    <div className={`${styles.card} ${styles.historySection}`}>
        <div className={styles.historyHeader}>
            <p className={styles.sectionTitle} style={{ margin: 0 }}>Points History</p>
            {items.length > 0 && (
                <span className={styles.historyCount}>{items.length} transaction{items.length !== 1 ? "s" : ""}</span>
            )}
        </div>

        {items.length === 0 ? (
            <div className={styles.emptyHistory}>
                <div className={styles.emptyIconWrap}>
                    <EmptyHistoryIcon />
                </div>
                <p className={styles.emptyTitle}>No transactions yet</p>
                <p className={styles.emptyText}>
                    Your points will appear here after your first ticket booking.
                    Every purchase earns you points toward your next tier.
                </p>
            </div>
        ) : (
            <div className={styles.historyList}>
                {items.map((entry, i) => (
                    <HistoryRow key={i} entry={entry} />
                ))}
            </div>
        )}
    </div>
);

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */
const MembershipSkeleton: FC = () => (
    <div className={styles.page}>
        <div className={styles.skeletonHero}><Skeleton active paragraph={{ rows: 3 }} /></div>
        <div className={`${styles.card} ${styles.roadmapSection}`}><Skeleton active paragraph={{ rows: 2 }} /></div>
        <div className={`${styles.card} ${styles.historySection}`}><Skeleton active paragraph={{ rows: 3 }} /></div>
    </div>
);

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const MembershipPage: FC = () => {
    const { data: info, isLoading: infoLoading, isError } = useMembershipInfo();
    const { data: tiers = [], isLoading: tiersLoading } = useMembershipTiers();
    const { data: history = [] } = usePointsHistory();
    const { data: profile } = useProfile();

    if (infoLoading || tiersLoading) return <MembershipSkeleton />;

    if (isError || !info) {
        return (
            <div className={`${styles.card} ${styles.errorState}`}>
                <div style={{ color: "#5a4040" }}><ErrorIcon /></div>
                <p className={styles.emptyTitle}>Failed to load membership</p>
                <p className={styles.emptyText}>Please try again later.</p>
            </div>
        );
    }

    const refundsRemaining = profile ? Math.max(0, profile.total_refunds - profile.used_refunds) : null;
    const totalRefunds = profile ? profile.total_refunds : null;

    return (
        <div className={styles.page}>
            <HeroCard info={info} refundsRemaining={refundsRemaining} totalRefunds={totalRefunds} />
            {tiers.length > 0 && <TierRoadmap info={info} tiers={tiers} />}
            <PointsHistory items={history} />
        </div>
    );
};

export default MembershipPage;
