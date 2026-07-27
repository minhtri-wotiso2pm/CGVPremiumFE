import { useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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
import { formatPrice, } from "../utils/seat.utils";
import { formatNumber } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
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

const fmtDiscount = (t: TFunction, discountType: string, discountValue: number): string =>
    discountType === "fixed"
        ? t("profile:vouchers.discountFixed", { amount: formatNumber(discountValue) })
        : t("profile:vouchers.discountPercent", { value: discountValue });

const fmtValidUntil = (iso?: string): string => {
    if (!iso) return "";
    return dayjs(iso).isValid() ? formatDate(iso) : "";
};

const isUnexpired = (expiredAt: string | null): boolean =>
    !expiredAt || new Date(expiredAt).getTime() > Date.now();

/** Restriction chip for a public (admin-shaped) rule, which — unlike the
 *  loyalty endpoints — carries no server-rendered displayText. */
const describePublicRule = (t: TFunction, ruleType: string, ruleValue: string): string => {
    const list = () => ruleValue.split(",").map((v) => v.trim()).filter(Boolean).join(", ");
    switch (ruleType) {
        case "ApplyScope": {
            const s = ruleValue.toLowerCase();
            if (s === "ticket") return t("voucherPicker.ruleTicketsOnly");
            if (s === "fnb" || s === "food") return t("voucherPicker.ruleFnbOnly");
            return t("voucherPicker.ruleWholeOrder");
        }
        case "DayOfWeek": return t("voucherPicker.ruleOnlyDays", { days: list() });
        case "Cinema": return t("voucherPicker.ruleCinemas");
        case "Room": return t("voucherPicker.ruleRooms");
        case "Movie": return t("voucherPicker.ruleMovies");
        case "SeatType": return t("voucherPicker.ruleSeatType", { types: list() });
        case "Membership": return t("voucherPicker.ruleMembership", { tier: ruleValue });
        case "PaymentMethod": return t("voucherPicker.rulePaymentMethod", { method: ruleValue });
        case "Product": return t("voucherPicker.ruleProduct");
        case "FoodCategory": return t("voucherPicker.ruleFoodCategory", { category: ruleValue });
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
    const { t } = useTranslation("booking");
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
                ruleTags: v.rules.map((r) => describePublicRule(t, r.ruleType, r.ruleValue)),
                rules: v.rules,
            }));
    }, [publicData, t]);

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
        const { eligible, reasonKey, reasonParams } = getEligibility(v);
        const reason = reasonKey ? t(reasonKey, reasonParams) : undefined;
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
                            {fmtDiscount(t, v.discountType, v.discountValue)}
                            {v.quantity && v.quantity > 1 ? ` · ×${v.quantity}` : ""}
                        </span>
                        {isApplied ? (
                            <span className={styles.appliedBadge}>{t("voucherPicker.applied")}</span>
                        ) : eligible ? (
                            <span className={styles.rowAction}>{t("voucherPicker.use")}</span>
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
                            <span className={styles.metaChip}>{t("voucherPicker.min", { amount: formatPrice(v.minOrderValue) })}</span>
                        )}
                        {v.validUntil && (
                            <span className={styles.metaChip}>{t("voucherPicker.until", { date: fmtValidUntil(v.validUntil) })}</span>
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
            label: t("profile:vouchers.myVouchersTab"),
            children: myVouchersLoading ? (
                <p className={styles.empty}>{t("profile:vouchers.loadingMine")}</p>
            ) : available.length === 0 ? (
                <p className={styles.empty}>{t("voucherPicker.emptyMine")}</p>
            ) : (
                <div className={styles.list}>{available.map(renderPickRow)}</div>
            ),
        },
        {
            key: "public",
            label: t("voucherPicker.promosTab"),
            children: publicLoading ? (
                <p className={styles.empty}>{t("voucherPicker.loadingPromos")}</p>
            ) : publicVouchers.length === 0 ? (
                <p className={styles.empty}>{t("voucherPicker.emptyPromos")}</p>
            ) : (
                <div className={styles.list}>{publicVouchers.map(renderPickRow)}</div>
            ),
        },
        {
            key: "redeem",
            label: t("profile:vouchers.redeemTab"),
            children: redeemableLoading ? (
                <p className={styles.empty}>{t("profile:vouchers.loading")}</p>
            ) : eligibleRedeemable.length === 0 ? (
                <p className={styles.empty}>{t("voucherPicker.emptyRedeem")}</p>
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
                                            {fmtDiscount(t, v.discountType, v.discountValue)}
                                        </span>
                                        {canAfford ? (
                                            <Button className={styles.redeemBtn} onClick={() => handleRedeem(v)}>
                                                {t("profile:vouchers.redeem")}
                                            </Button>
                                        ) : (
                                            <Tooltip title={t("profile:vouchers.needMoreTooltip", { points: formatNumber(gap) })}>
                                                <span className={styles.needMoreChip}>
                                                    <LockIcon size={11} /> {t("voucherPicker.moreShort", { points: formatNumber(gap) })}
                                                </span>
                                            </Tooltip>
                                        )}
                                    </div>
                                    <span className={styles.rowCode}>{v.voucherCode}</span>
                                    <span className={styles.rowPoints}>
                                        <StarPointsIcon size={12} /> {formatNumber(v.requiredPoints)} {t("profile:tickets.pts")}
                                    </span>
                                    {v.description && <p className={styles.cardDesc}>{v.description}</p>}
                                    <div className={styles.metaRow}>
                                        {v.minOrderValue > 0 && (
                                            <span className={styles.metaChip}>{t("voucherPicker.min", { amount: formatPrice(v.minOrderValue) })}</span>
                                        )}
                                        {v.validUntil && (
                                            <span className={styles.metaChip}>{t("voucherPicker.until", { date: fmtValidUntil(v.validUntil) })}</span>
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
                        <span className={styles.title}>{t("voucherPicker.title")}</span>
                        <span className={styles.pointsPill}>
                            <StarPointsIcon size={14} /> {formatNumber(totalPoints)} {t("profile:tickets.pts")}
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
                            <span>{t("ticketDetail.seats")}</span>
                            <span className={styles.summaryVal}>{formatPrice(seatsSubTotal ?? 0)}</span>
                        </div>
                        {(fnBSubTotal ?? 0) > 0 && (
                            <div className={styles.summaryRow}>
                                <span>{t("fnb.foodBeverage")}</span>
                                <span className={styles.summaryVal}>{formatPrice(fnBSubTotal ?? 0)}</span>
                            </div>
                        )}
                        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                            <span>{t("voucherPicker.orderTotal")}</span>
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
