import { useMemo, useState, type FC } from "react";
import { Modal, Tabs, Button, Tooltip } from "antd";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { useMyVouchers, useRedeemableVouchers } from "@/features/customer/hooks/useLoyaltyVouchers";
import { useMembershipInfo } from "@/features/customer/hooks/useMembership";
import { isWithinValidityWindow } from "@/features/customer/utils/voucherWindow";
import RedeemConfirmModal from "@/features/customer/components/RedeemConfirmModal";
import type { RedeemableVoucher, RedeemableVoucherLike } from "@/features/customer/types/loyaltyVoucher.types";
import { useVouchers } from "@/features/vouchers/hooks/useVouchers";
import { GiftIcon, StarPointsIcon, LockIcon } from "@/components/ui/BrandIcons";
import { formatPrice } from "../utils/seat.utils";
import {
    evaluateVoucherEligibility,
    type EligibilityContext,
    type EligibilityRuleLike,
} from "../utils/voucherEligibility";
import styles from "./VoucherPickerModal.module.css";

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (code: string) => void;
    /** Current order subtotals — drive the price summary and eligibility check.
     *  Undefined (pricing still loading) ⇒ no voucher is greyed out. */
    seatsSubTotal?: number;
    fnBSubTotal?: number;
    /** Showtime context for Cinema / DayOfWeek rules. */
    cinemaId?: number;
    startTime?: string;
    /** Code already applied on the payment page, so the picker can mark it. */
    appliedCode?: string | null;
}

/** One card in the My Vouchers / Available Promos lists — a shape both the
 *  loyalty (`/my-vouchers`) and admin-shaped public (`/vouchers`) rows map to. */
interface PickVoucher {
    key: string;
    voucherCode: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    validUntil?: string;
    description?: string;
    imageUrl: string | null;
    quantity?: number;
    /** Human-readable restriction chips. */
    ruleTags: string[];
    /** Raw rules for eligibility evaluation. */
    rules: EligibilityRuleLike[];
}

const fmtDiscount = (discountType: string, discountValue: number): string =>
    discountType === "fixed"
        ? `${discountValue.toLocaleString("vi-VN")} ₫ Off`
        : `${discountValue}% Off`;

const fmtPoints = (n: number) => n.toLocaleString("en-US");

const fmtDate = (iso?: string): string => {
    if (!iso) return "";
    const d = dayjs(iso);
    return d.isValid() ? d.format("MMM D, YYYY") : "";
};

const isUnexpired = (expiredAt: string | null): boolean =>
    !expiredAt || new Date(expiredAt).getTime() > Date.now();

/** English restriction chip for a public (admin-shaped) rule, which — unlike
 *  the loyalty endpoints — carries no server-rendered displayText. */
const describePublicRule = (ruleType: string, ruleValue: string): string => {
    const list = () => ruleValue.split(",").map((v) => v.trim()).filter(Boolean).join(", ");
    switch (ruleType) {
        case "ApplyScope": {
            const s = ruleValue.toLowerCase();
            if (s === "ticket") return "Tickets only";
            if (s === "fnb" || s === "food") return "Food & drinks only";
            return "Whole order";
        }
        case "DayOfWeek": return `Only ${list()}`;
        case "Cinema": return "Selected cinemas only";
        case "Room": return "Selected rooms only";
        case "Movie": return "Selected movies only";
        case "SeatType": return `Seat type: ${list()}`;
        case "Membership": return `${ruleValue} members`;
        case "PaymentMethod": return `Pay via ${ruleValue}`;
        case "Product": return "Requires a specific item";
        case "FoodCategory": return `Requires ${ruleValue}`;
        default: return `${ruleType}: ${ruleValue}`;
    }
};

/** Lets a signed-in customer pick an already-redeemed voucher, redeem a new
 *  one with points, or apply a public promo code — all without leaving
 *  checkout (and its seat-hold timer). Shows the order's price breakdown and
 *  greys out vouchers that don't apply so the choice is informed. */
const VoucherPickerModal: FC<Props> = ({
    open,
    onClose,
    onSelect,
    seatsSubTotal,
    fnBSubTotal,
    cinemaId,
    startTime,
    appliedCode,
}) => {
    const [activeTab, setActiveTab] = useState("mine");
    const [redeemTarget, setRedeemTarget] = useState<RedeemableVoucherLike | null>(null);

    const isLoggedIn = useAppSelector((s) => s.auth.user != null);
    const fetchEnabled = isLoggedIn && open;

    const { data: membership } = useMembershipInfo(fetchEnabled);
    const totalPoints = membership?.totalPoints ?? 0;

    const { data: myVouchers = [], isLoading: myVouchersLoading } = useMyVouchers(fetchEnabled);
    const { data: redeemable = [], isLoading: redeemableLoading } = useRedeemableVouchers(fetchEnabled);
    const { data: publicData, isLoading: publicLoading } = useVouchers(
        { pageIndex: 1, pageSize: 100 },
        fetchEnabled,
    );

    // Only evaluate eligibility once we actually have the order's subtotals —
    // otherwise every min-order/scope rule would wrongly grey out mid-load.
    const canEvaluate = seatsSubTotal != null && fnBSubTotal != null;
    const orderTotal = (seatsSubTotal ?? 0) + (fnBSubTotal ?? 0);
    const evalCtx: EligibilityContext = useMemo(
        () => ({
            seatsSubTotal: seatsSubTotal ?? 0,
            fnBSubTotal: fnBSubTotal ?? 0,
            cinemaId,
            startTime,
        }),
        [seatsSubTotal, fnBSubTotal, cinemaId, startTime],
    );

    const getEligibility = (v: PickVoucher) =>
        canEvaluate
            ? evaluateVoucherEligibility({ minOrderValue: v.minOrderValue, rules: v.rules }, evalCtx)
            : { eligible: true as const };

    // /vouchers/my-vouchers already only returns vouchers with at least one
    // usable copy — this is just a defensive expiry check on top of that.
    const available: PickVoucher[] = useMemo(
        () =>
            myVouchers
                .filter((v) => isUnexpired(v.expiredAt))
                .map((v) => ({
                    key: v.voucherCode,
                    voucherCode: v.voucherCode,
                    discountType: v.discountType,
                    discountValue: v.discountValue,
                    minOrderValue: v.minOrderValue,
                    validUntil: v.validUntil,
                    description: v.description,
                    imageUrl: v.imageUrl,
                    quantity: v.quantity,
                    ruleTags: v.voucherRules.map((r) => r.displayText).filter(Boolean),
                    rules: v.voucherRules,
                })),
        [myVouchers],
    );

    const eligibleRedeemable = useMemo(
        () => redeemable.filter((v) => isWithinValidityWindow(v.validFrom, v.validUntil)),
        [redeemable],
    );

    const publicVouchers: PickVoucher[] = useMemo(() => {
        const now = dayjs();
        return (publicData?.items ?? [])
            .filter((v) => v.isActive && !v.isRedeemable && (!v.validUntil || dayjs(v.validUntil).isAfter(now)))
            .map((v) => ({
                key: String(v.voucherId),
                voucherCode: v.voucherCode,
                discountType: v.discountType,
                discountValue: v.discountValue,
                minOrderValue: v.minOrderValue,
                validUntil: v.validUntil,
                description: v.description,
                imageUrl: v.imageUrl,
                ruleTags: v.rules.map((r) => describePublicRule(r.ruleType, r.ruleValue)),
                rules: v.rules,
            }));
    }, [publicData]);

    const handleRedeem = (voucher: RedeemableVoucher) => {
        setRedeemTarget({
            voucherId: voucher.voucherId,
            voucherCode: voucher.voucherCode,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            requiredPoints: voucher.requiredPoints,
        });
    };

    const applyCode = (code: string) => {
        onSelect(code);
        onClose();
    };

    /* ── Shared card for a selectable (My Vouchers / Promos) voucher ── */
    const renderPickRow = (v: PickVoucher) => {
        const { eligible, reason } = getEligibility(v);
        const isApplied = !!appliedCode && appliedCode.toUpperCase() === v.voucherCode.toUpperCase();
        return (
            <button
                key={v.key}
                type="button"
                className={`${styles.card}${eligible ? "" : ` ${styles.cardDisabled}`}${isApplied ? ` ${styles.cardApplied}` : ""}`}
                onClick={() => eligible && applyCode(v.voucherCode)}
                disabled={!eligible}
                aria-disabled={!eligible}
            >
                {v.imageUrl ? (
                    <img src={v.imageUrl} alt="" className={styles.rowThumb} />
                ) : (
                    <div className={styles.rowThumbPh}><GiftIcon size={18} /></div>
                )}
                <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                        <span className={styles.rowDiscount}>
                            {fmtDiscount(v.discountType, v.discountValue)}
                            {v.quantity && v.quantity > 1 ? ` · ×${v.quantity}` : ""}
                        </span>
                        {isApplied ? (
                            <span className={styles.appliedBadge}>Applied</span>
                        ) : eligible ? (
                            <span className={styles.rowAction}>Use</span>
                        ) : (
                            <Tooltip title={reason}>
                                <span className={styles.reasonChip}>
                                    <LockIcon size={10} /> {reason}
                                </span>
                            </Tooltip>
                        )}
                    </div>
                    <span className={styles.rowCode}>{v.voucherCode}</span>
                    {v.description && <p className={styles.cardDesc}>{v.description}</p>}
                    <div className={styles.metaRow}>
                        {v.minOrderValue > 0 && (
                            <span className={styles.metaChip}>Min. {formatPrice(v.minOrderValue)}</span>
                        )}
                        {v.validUntil && (
                            <span className={styles.metaChip}>Until {fmtDate(v.validUntil)}</span>
                        )}
                    </div>
                    {v.ruleTags.length > 0 && (
                        <div className={styles.ruleTags}>
                            {v.ruleTags.map((t, i) => (
                                <span key={`${t}-${i}`} className={styles.ruleTag}>{t}</span>
                            ))}
                        </div>
                    )}
                </div>
            </button>
        );
    };

    const items = [
        {
            key: "mine",
            label: "My Vouchers",
            children: myVouchersLoading ? (
                <p className={styles.empty}>Loading your vouchers…</p>
            ) : available.length === 0 ? (
                <p className={styles.empty}>You don't have any vouchers ready to use yet.</p>
            ) : (
                <div className={styles.list}>{available.map(renderPickRow)}</div>
            ),
        },
        {
            key: "public",
            label: "Available Promos",
            children: publicLoading ? (
                <p className={styles.empty}>Loading promotions…</p>
            ) : publicVouchers.length === 0 ? (
                <p className={styles.empty}>No public promotions right now.</p>
            ) : (
                <div className={styles.list}>{publicVouchers.map(renderPickRow)}</div>
            ),
        },
        {
            key: "redeem",
            label: "Redeem with Points",
            children: redeemableLoading ? (
                <p className={styles.empty}>Loading vouchers…</p>
            ) : eligibleRedeemable.length === 0 ? (
                <p className={styles.empty}>Nothing to redeem right now.</p>
            ) : (
                <div className={styles.list}>
                    {eligibleRedeemable.map((v) => {
                        const canAfford = totalPoints >= v.requiredPoints;
                        const gap = v.requiredPoints - totalPoints;
                        return (
                            <div key={v.voucherId} className={styles.redeemRow}>
                                {v.imageUrl ? (
                                    <img src={v.imageUrl} alt="" className={styles.rowThumb} />
                                ) : (
                                    <div className={styles.rowThumbPh}><GiftIcon size={18} /></div>
                                )}
                                <div className={styles.cardBody}>
                                    <div className={styles.cardTop}>
                                        <span className={styles.rowDiscount}>
                                            {fmtDiscount(v.discountType, v.discountValue)}
                                        </span>
                                        {canAfford ? (
                                            <Button className={styles.redeemBtn} onClick={() => handleRedeem(v)}>
                                                Redeem
                                            </Button>
                                        ) : (
                                            <Tooltip title={`You need ${fmtPoints(gap)} more points.`}>
                                                <span className={styles.needMoreChip}>
                                                    <LockIcon size={11} /> {fmtPoints(gap)} more
                                                </span>
                                            </Tooltip>
                                        )}
                                    </div>
                                    <span className={styles.rowPoints}>
                                        <StarPointsIcon size={12} /> {fmtPoints(v.requiredPoints)} pts
                                    </span>
                                    {v.description && <p className={styles.cardDesc}>{v.description}</p>}
                                    <div className={styles.metaRow}>
                                        {v.minOrderValue > 0 && (
                                            <span className={styles.metaChip}>Min. {formatPrice(v.minOrderValue)}</span>
                                        )}
                                        {v.validUntil && (
                                            <span className={styles.metaChip}>Until {fmtDate(v.validUntil)}</span>
                                        )}
                                    </div>
                                    {v.voucherRules.length > 0 && (
                                        <div className={styles.ruleTags}>
                                            {v.voucherRules.map((r, i) => (
                                                <span key={`${r.ruleType}-${i}`} className={styles.ruleTag}>
                                                    {r.displayText}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ),
        },
    ];

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                title={
                    <div className={styles.headerRow}>
                        <span className={styles.title}>Choose a Voucher</span>
                        <span className={styles.pointsPill}>
                            <StarPointsIcon size={14} /> {fmtPoints(totalPoints)} pts
                        </span>
                    </div>
                }
                footer={null}
                width={520}
                destroyOnClose
                styles={{
                    container: { background: "#1a0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" },
                    header: { background: "#1a0f0f", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                    mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.7)" },
                }}
            >
                {/* Order price summary — so the customer can judge which voucher fits. */}
                {canEvaluate && (
                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span>Seats</span>
                            <span className={styles.summaryVal}>{formatPrice(seatsSubTotal ?? 0)}</span>
                        </div>
                        {(fnBSubTotal ?? 0) > 0 && (
                            <div className={styles.summaryRow}>
                                <span>Food &amp; Beverage</span>
                                <span className={styles.summaryVal}>{formatPrice(fnBSubTotal ?? 0)}</span>
                            </div>
                        )}
                        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                            <span>Order total</span>
                            <span className={styles.summaryVal}>{formatPrice(orderTotal)}</span>
                        </div>
                    </div>
                )}
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} className={styles.tabs} />
            </Modal>

            <RedeemConfirmModal
                voucher={redeemTarget}
                totalPoints={totalPoints}
                onClose={() => setRedeemTarget(null)}
                onRedeemed={() => {
                    setRedeemTarget(null);
                    setActiveTab("mine");
                }}
            />
        </>
    );
};

export default VoucherPickerModal;
