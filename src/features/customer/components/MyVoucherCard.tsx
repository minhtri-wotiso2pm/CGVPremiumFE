import type { FC } from "react";
import { Button } from "antd";
import { GiftOutlined } from "@ant-design/icons";
import type { MyVoucher } from "../types/loyaltyVoucher.types";
import { notify } from "@/utils/notify";
import styles from "./VoucherCard.module.css";

const fmtDiscount = (discountType: string, discountValue: number): string =>
    discountType === "fixed"
        ? `${discountValue.toLocaleString("vi-VN")} ₫ Off`
        : `${discountValue}% Off`;

const fmtDate = (iso: string | null): string => {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return "";
    }
};

const statusStyle = (status: string): { bg: string; color: string; label: string } => {
    const s = status.toLowerCase();
    if (s === "available") return { bg: "rgba(34,197,94,0.14)", color: "#4ade80", label: "Available" };
    if (s === "used") return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", label: "Used" };
    if (s === "expired") return { bg: "rgba(248,113,113,0.14)", color: "#f87171", label: "Expired" };
    return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", label: status };
};

interface Props {
    voucher: MyVoucher;
}

const MyVoucherCard: FC<Props> = ({ voucher }) => {
    const st = statusStyle(voucher.status);
    const isAvailable = voucher.status.toLowerCase() === "available";

    const copyCode = () => {
        navigator.clipboard
            .writeText(voucher.voucherCode)
            .then(() => notify.success("Copied", `${voucher.voucherCode} copied to clipboard.`));
    };

    return (
        <div className={`${styles.card} ${!isAvailable ? styles.cardDim : ""}`}>
            {voucher.imageUrl ? (
                <img src={voucher.imageUrl} alt={voucher.voucherCode} className={styles.banner} />
            ) : (
                <div className={styles.bannerPh}><GiftOutlined /></div>
            )}

            <div className={styles.body}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span className={styles.discountHeadline}>
                        {fmtDiscount(voucher.discountType, voucher.discountValue)}
                    </span>
                    <span className={styles.statusBadge} style={{ background: st.bg, color: st.color }}>
                        {st.label}
                    </span>
                </div>
                <span className={styles.code}>{voucher.voucherCode}</span>
                <span className={styles.meta}>
                    {isAvailable && voucher.expiredAt
                        ? `Expires ${fmtDate(voucher.expiredAt)}`
                        : voucher.usedAt
                            ? `Used ${fmtDate(voucher.usedAt)}`
                            : `Redeemed ${fmtDate(voucher.redeemedAt)}`}
                </span>

                {isAvailable && (
                    <div className={styles.footer}>
                        <Button className={styles.copyBtn} onClick={copyCode}>Copy Code</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyVoucherCard;
