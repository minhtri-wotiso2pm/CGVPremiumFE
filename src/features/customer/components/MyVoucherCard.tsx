import type { FC } from "react";
import { Button } from "antd";
import type { MyVoucher } from "../types/loyaltyVoucher.types";
import { notify } from "@/utils/notify";
import { GiftIcon, CopyIcon } from "@/components/ui/BrandIcons";
import VoucherRuleTags from "./VoucherRuleTags";
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

interface Props {
    voucher: MyVoucher;
}

/** Everything the wallet API returns is, by construction, still usable —
 *  Used/Expired copies are omitted server-side, so there's no status to
 *  branch on here anymore, only how many usable copies are held. */
const MyVoucherCard: FC<Props> = ({ voucher }) => {
    const copyCode = () => {
        navigator.clipboard
            .writeText(voucher.voucherCode)
            .then(() => notify.success("Copied", `${voucher.voucherCode} copied to clipboard.`));
    };

    return (
        <div className={styles.card}>
            {voucher.imageUrl ? (
                <img src={voucher.imageUrl} alt={voucher.voucherCode} className={styles.banner} />
            ) : (
                <div className={styles.bannerPh}><GiftIcon size={28} /></div>
            )}

            <div className={styles.body}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span className={styles.discountHeadline}>
                        {fmtDiscount(voucher.discountType, voucher.discountValue)}
                    </span>
                    {voucher.quantity > 1 && (
                        <span className={styles.quantityBadge}>×{voucher.quantity}</span>
                    )}
                </div>
                <span className={styles.code}>{voucher.voucherCode}</span>
                <VoucherRuleTags rules={voucher.voucherRules} />
                {voucher.expiredAt && (
                    <span className={styles.meta}>Expires {fmtDate(voucher.expiredAt)}</span>
                )}

                <div className={styles.footer}>
                    <Button className={styles.copyBtn} onClick={copyCode} icon={<CopyIcon size={14} />}>
                        Copy Code
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MyVoucherCard;
