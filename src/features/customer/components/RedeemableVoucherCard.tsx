import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Button, Tooltip } from "antd";
import type { RedeemableVoucher } from "../types/loyaltyVoucher.types";
import { GiftIcon, StarPointsIcon, LockIcon } from "@/components/ui/BrandIcons";
import { formatNumber } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import VoucherRuleTags from "./VoucherRuleTags";
import styles from "./VoucherCard.module.css";

const fmtDiscount = (t: TFunction, discountType: string, discountValue: number): string =>
    discountType === "fixed"
        ? t("profile:vouchers.discountFixed", { amount: formatNumber(discountValue) })
        : t("profile:vouchers.discountPercent", { value: discountValue });

interface Props {
    voucher: RedeemableVoucher;
    totalPoints: number;
    onRedeem: (voucher: RedeemableVoucher) => void;
}

const RedeemableVoucherCard: FC<Props> = ({ voucher, totalPoints, onRedeem }) => {
    const { t } = useTranslation("profile");
    const canAfford = totalPoints >= voucher.requiredPoints;
    const gap = voucher.requiredPoints - totalPoints;

    return (
        <div className={`${styles.card} ${!canAfford ? styles.cardDim : ""}`}>
            {voucher.imageUrl ? (
                <img src={voucher.imageUrl} alt={voucher.voucherCode} className={styles.banner} />
            ) : (
                <div className={styles.bannerPh}><GiftIcon size={28} /></div>
            )}

            <div className={styles.body}>
                <span className={styles.discountHeadline}>
                    {fmtDiscount(t, voucher.discountType, voucher.discountValue)}
                </span>
                <span className={styles.code}>{voucher.voucherCode}</span>
                {voucher.description && <p className={styles.description}>{voucher.description}</p>}
                <VoucherRuleTags rules={voucher.voucherRules} />
                <span className={styles.meta}>
                    {t("vouchers.validUntil", { date: formatDate(voucher.validUntil) })}
                    {voucher.exchangeLimit > 0 ? ` · ${t("vouchers.perCustomerLimit", { count: voucher.exchangeLimit })}` : ""}
                </span>

                <div className={styles.footer}>
                    <span className={styles.pointsCost}>
                        <StarPointsIcon size={14} /> {formatNumber(voucher.requiredPoints)} {t("tickets.pts")}
                    </span>
                    {canAfford ? (
                        <Button className={styles.redeemBtn} onClick={() => onRedeem(voucher)}>
                            {t("vouchers.redeem")}
                        </Button>
                    ) : (
                        <Tooltip title={t("vouchers.needMoreTooltip", { points: formatNumber(gap) })}>
                            <span className={styles.needMoreChip}>
                                <LockIcon size={12} /> {t("vouchers.needMore", { points: formatNumber(gap) })}
                            </span>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RedeemableVoucherCard;
