import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Modal, Button } from "antd";
import axios from "axios";
import type { RedeemableVoucherLike } from "../types/loyaltyVoucher.types";
import { useRedeemVoucher } from "../hooks/useLoyaltyVouchers";
import { ChevronRightIcon } from "@/components/ui/BrandIcons";
import { formatNumber } from "@/utils/formatCurrency";
import styles from "./RedeemConfirmModal.module.css";

const fmtDiscount = (t: TFunction, discountType: string, discountValue: number): string =>
    discountType === "fixed"
        ? t("profile:vouchers.discountFixed", { amount: formatNumber(discountValue) })
        : t("profile:vouchers.discountPercent", { value: discountValue });

interface Props {
    voucher: RedeemableVoucherLike | null;
    totalPoints: number;
    onClose: () => void;
    onRedeemed: () => void;
}

/** Richer confirmation than a Popconfirm — spending points needs the balance
 *  before/after shown, plus a place to surface a failed-redeem server message
 *  (the redeemable list has no per-user redemption count, so a 400 here is
 *  the only signal that this voucher's exchangeLimit was already hit). */
const RedeemConfirmModal: FC<Props> = ({ voucher, totalPoints, onClose, onRedeemed }) => {
    const { t } = useTranslation("profile");
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
            title={<span className={styles.title}>{t("vouchers.redeemModalTitle")}</span>}
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
                        {fmtDiscount(t, voucher.discountType, voucher.discountValue)}
                    </span>
                    <span className={styles.code}>{voucher.voucherCode}</span>
                </div>

                <div className={styles.balanceRow}>
                    <div className={styles.balanceCell}>
                        <span className={styles.balanceLabel}>{t("vouchers.currentPoints")}</span>
                        <span className={styles.balanceValue}>{formatNumber(totalPoints)}</span>
                    </div>
                    <span className={styles.arrow}><ChevronRightIcon size={16} /></span>
                    <div className={styles.balanceCell}>
                        <span className={styles.balanceLabel}>{t("vouchers.afterRedeem")}</span>
                        <span
                            className={styles.balanceValue}
                            style={{ color: remaining < 0 ? "#f87171" : "#4ade80" }}
                        >
                            {formatNumber(Math.max(0, remaining))}
                        </span>
                    </div>
                </div>

                {serverMessage && <div className={styles.errorBanner}>{serverMessage}</div>}

                <div className={styles.actions}>
                    <Button onClick={handleClose} className={styles.cancelBtn} disabled={isPending}>
                        {t("common:actions.cancel")}
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        loading={isPending}
                        className={styles.confirmBtn}
                    >
                        {t("vouchers.confirmSpend", { points: formatNumber(voucher.requiredPoints) })}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RedeemConfirmModal;
