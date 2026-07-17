import type { FC } from "react";
import { Modal, Button } from "antd";
import axios from "axios";
import type { RedeemableVoucher } from "../types/loyaltyVoucher.types";
import { useRedeemVoucher } from "../hooks/useLoyaltyVouchers";
import styles from "./RedeemConfirmModal.module.css";

const fmtDiscount = (discountType: string, discountValue: number): string =>
    discountType === "fixed"
        ? `${discountValue.toLocaleString("vi-VN")} ₫ Off`
        : `${discountValue}% Off`;

const fmtPoints = (n: number) => n.toLocaleString("en-US");

interface Props {
    voucher: RedeemableVoucher | null;
    totalPoints: number;
    onClose: () => void;
    onRedeemed: () => void;
}

/** Richer confirmation than a Popconfirm — spending points needs the balance
 *  before/after shown, plus a place to surface a failed-redeem server message
 *  (the redeemable list has no per-user redemption count, so a 400 here is
 *  the only signal that this voucher's exchangeLimit was already hit). */
const RedeemConfirmModal: FC<Props> = ({ voucher, totalPoints, onClose, onRedeemed }) => {
    const { mutate: redeem, isPending, error, reset } = useRedeemVoucher();

    if (!voucher) return null;

    const handleClose = () => {
        if (isPending) return;
        reset();
        onClose();
    };

    const handleConfirm = () => {
        redeem(voucher.voucherId, {
            onSuccess: () => {
                reset();
                onRedeemed();
            },
        });
    };

    const serverMessage = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
    const remaining = totalPoints - voucher.requiredPoints;

    return (
        <Modal
            open
            onCancel={handleClose}
            title={<span className={styles.title}>Redeem Voucher</span>}
            footer={null}
            width={420}
            destroyOnClose
            closable={!isPending}
            maskClosable={!isPending}
            styles={{
                container: { background: "#0d0303", border: "1px solid rgba(255,255,255,0.07)" },
                header: { background: "#0d0303", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                mask: { backdropFilter: "blur(6px)" },
            }}
        >
            <div className={styles.body}>
                <div className={styles.summary}>
                    <span className={styles.discount}>
                        {fmtDiscount(voucher.discountType, voucher.discountValue)}
                    </span>
                    <span className={styles.code}>{voucher.voucherCode}</span>
                </div>

                <div className={styles.balanceRow}>
                    <div className={styles.balanceCell}>
                        <span className={styles.balanceLabel}>Current Points</span>
                        <span className={styles.balanceValue}>{fmtPoints(totalPoints)}</span>
                    </div>
                    <span className={styles.arrow}>→</span>
                    <div className={styles.balanceCell}>
                        <span className={styles.balanceLabel}>After Redeem</span>
                        <span
                            className={styles.balanceValue}
                            style={{ color: remaining < 0 ? "#f87171" : "#4ade80" }}
                        >
                            {fmtPoints(Math.max(0, remaining))}
                        </span>
                    </div>
                </div>

                {serverMessage && <div className={styles.errorBanner}>{serverMessage}</div>}

                <div className={styles.actions}>
                    <Button onClick={handleClose} className={styles.cancelBtn} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        loading={isPending}
                        className={styles.confirmBtn}
                    >
                        Confirm — Spend {fmtPoints(voucher.requiredPoints)} pts
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RedeemConfirmModal;
