import type { FC } from "react";
import { Modal } from "antd";
import { useMyVouchers } from "@/features/customer/hooks/useLoyaltyVouchers";
import styles from "./VoucherPickerModal.module.css";

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (code: string) => void;
}

const fmtDiscount = (discountType: string, discountValue: number): string =>
    discountType === "fixed"
        ? `${discountValue.toLocaleString("vi-VN")} ₫ Off`
        : `${discountValue}% Off`;

const isUnexpired = (expiredAt: string | null): boolean =>
    !expiredAt || new Date(expiredAt).getTime() > Date.now();

/** Lets a signed-in customer pick an already-redeemed voucher instead of retyping its code. */
const VoucherPickerModal: FC<Props> = ({ open, onClose, onSelect }) => {
    const { data: vouchers = [], isLoading } = useMyVouchers();

    const available = vouchers.filter(
        (v) => v.status.toLowerCase() === "available" && isUnexpired(v.expiredAt),
    );

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={<span className={styles.title}>Choose a Voucher</span>}
            footer={null}
            width={420}
            destroyOnClose
            styles={{
                container: { background: "#1a0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" },
                header: { background: "#1a0f0f", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.7)" },
            }}
        >
            {isLoading ? (
                <p className={styles.empty}>Loading your vouchers…</p>
            ) : available.length === 0 ? (
                <p className={styles.empty}>You don't have any vouchers ready to use yet.</p>
            ) : (
                <div className={styles.list}>
                    {available.map((v) => (
                        <button
                            key={v.userVoucherId}
                            type="button"
                            className={styles.row}
                            onClick={() => {
                                onSelect(v.voucherCode);
                                onClose();
                            }}
                        >
                            <div className={styles.rowInfo}>
                                <span className={styles.rowDiscount}>
                                    {fmtDiscount(v.discountType, v.discountValue)}
                                </span>
                                <span className={styles.rowCode}>{v.voucherCode}</span>
                            </div>
                            <span className={styles.rowUse}>Use</span>
                        </button>
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default VoucherPickerModal;
