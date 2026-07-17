import type { FC } from "react";
import { Button, Tooltip } from "antd";
import { GiftOutlined } from "@ant-design/icons";
import type { RedeemableVoucher } from "../types/loyaltyVoucher.types";
import styles from "./VoucherCard.module.css";

const fmtDiscount = (discountType: string, discountValue: number): string =>
    discountType === "fixed"
        ? `${discountValue.toLocaleString("vi-VN")} ₫ Off`
        : `${discountValue}% Off`;

const fmtPoints = (n: number) => n.toLocaleString("en-US");

const fmtDate = (iso: string): string => {
    try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return "";
    }
};

interface Props {
    voucher: RedeemableVoucher;
    totalPoints: number;
    onRedeem: (voucher: RedeemableVoucher) => void;
}

const RedeemableVoucherCard: FC<Props> = ({ voucher, totalPoints, onRedeem }) => {
    const canAfford = totalPoints >= voucher.requiredPoints;
    const gap = voucher.requiredPoints - totalPoints;

    return (
        <div className={`${styles.card} ${!canAfford ? styles.cardDim : ""}`}>
            {voucher.imageUrl ? (
                <img src={voucher.imageUrl} alt={voucher.voucherCode} className={styles.banner} />
            ) : (
                <div className={styles.bannerPh}><GiftOutlined /></div>
            )}

            <div className={styles.body}>
                <span className={styles.discountHeadline}>
                    {fmtDiscount(voucher.discountType, voucher.discountValue)}
                </span>
                <span className={styles.code}>{voucher.voucherCode}</span>
                {voucher.description && <p className={styles.description}>{voucher.description}</p>}
                <span className={styles.meta}>
                    Valid until {fmtDate(voucher.validUntil)}
                    {voucher.exchangeLimit > 0 ? ` · up to ${voucher.exchangeLimit} per customer` : ""}
                </span>

                <div className={styles.footer}>
                    <span className={styles.pointsCost}>⭐ {fmtPoints(voucher.requiredPoints)} pts</span>
                    {canAfford ? (
                        <Button className={styles.redeemBtn} onClick={() => onRedeem(voucher)}>
                            Redeem
                        </Button>
                    ) : (
                        <Tooltip title={`You need ${fmtPoints(gap)} more points to redeem this voucher.`}>
                            <span className={styles.needMoreChip}>Need {fmtPoints(gap)} more</span>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RedeemableVoucherCard;
