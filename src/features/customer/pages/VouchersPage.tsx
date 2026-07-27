import { useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, Button } from "antd";
import { useMembershipInfo } from "../hooks/useMembership";
import { useRedeemableVouchers, useMyVouchers } from "../hooks/useLoyaltyVouchers";
import { isWithinValidityWindow } from "../utils/voucherWindow";
import RedeemableVoucherCard from "../components/RedeemableVoucherCard";
import MyVoucherCard from "../components/MyVoucherCard";
import RedeemConfirmModal from "../components/RedeemConfirmModal";
import type { RedeemableVoucher } from "../types/loyaltyVoucher.types";
import { StarPointsIcon } from "@/components/ui/BrandIcons";
import { formatNumber } from "@/utils/formatCurrency";
import cardStyles from "../components/VoucherCard.module.css";
import styles from "./VouchersPage.module.css";

const VouchersPage: FC = () => {
    const { t } = useTranslation("profile");
    const [activeTab, setActiveTab] = useState("redeem");
    const [redeemTarget, setRedeemTarget] = useState<RedeemableVoucher | null>(null);

    const { data: membership } = useMembershipInfo();
    const {
        data: redeemable = [],
        isLoading: redeemableLoading,
        isError: redeemableError,
        refetch: refetchRedeemable,
    } = useRedeemableVouchers();
    const {
        data: myVouchers = [],
        isLoading: myVouchersLoading,
        isError: myVouchersError,
        refetch: refetchMyVouchers,
    } = useMyVouchers();

    const totalPoints = membership?.totalPoints ?? 0;

    // /vouchers/redeemable has no isActive field — the validity window is the
    // only client-side signal that a loyalty voucher has expired.
    const eligibleRedeemable = useMemo(
        () => redeemable.filter((v) => isWithinValidityWindow(v.validFrom, v.validUntil)),
        [redeemable],
    );

    const items = [
        {
            key: "redeem",
            label: t("vouchers.redeemTab"),
            children: redeemableLoading ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateText}>{t("vouchers.loading")}</p>
                </div>
            ) : redeemableError ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>{t("vouchers.loadFailedTitle")}</p>
                    <p className={styles.stateText}>{t("vouchers.loadFailedRedeemable")}</p>
                    <Button className={styles.retryBtn} onClick={() => refetchRedeemable()}>{t("common:actions.tryAgain")}</Button>
                </div>
            ) : eligibleRedeemable.length === 0 ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>{t("vouchers.emptyRedeemTitle")}</p>
                    <p className={styles.stateText}>{t("vouchers.emptyRedeemText")}</p>
                </div>
            ) : (
                <div className={cardStyles.grid}>
                    {eligibleRedeemable.map((v) => (
                        <RedeemableVoucherCard
                            key={v.voucherId}
                            voucher={v}
                            totalPoints={totalPoints}
                            onRedeem={setRedeemTarget}
                        />
                    ))}
                </div>
            ),
        },
        {
            key: "mine",
            label: t("vouchers.myVouchersTab"),
            children: myVouchersLoading ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateText}>{t("vouchers.loadingMine")}</p>
                </div>
            ) : myVouchersError ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>{t("vouchers.loadFailedTitle")}</p>
                    <p className={styles.stateText}>{t("vouchers.loadFailedMine")}</p>
                    <Button className={styles.retryBtn} onClick={() => refetchMyVouchers()}>{t("common:actions.tryAgain")}</Button>
                </div>
            ) : myVouchers.length === 0 ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>{t("vouchers.emptyMineTitle")}</p>
                    <p className={styles.stateText}>{t("vouchers.emptyMineText")}</p>
                </div>
            ) : (
                <div className={cardStyles.grid}>
                    {myVouchers.map((v) => (
                        <MyVoucherCard key={v.voucherCode} voucher={v} />
                    ))}
                </div>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{t("nav.vouchers")}</h1>
                    <p className={styles.subtitle}>
                        {t("vouchers.subtitle")}
                    </p>
                </div>
                <div className={styles.pointsPill}>
                    <span className={styles.pointsIcon}><StarPointsIcon size={18} /></span>
                    <span className={styles.pointsValue}>{formatNumber(totalPoints)}</span>
                    <span className={styles.pointsLabel}>{t("vouchers.points")}</span>
                </div>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} className={styles.tabs} />

            <RedeemConfirmModal
                voucher={redeemTarget}
                totalPoints={totalPoints}
                onClose={() => setRedeemTarget(null)}
                onRedeemed={() => {
                    setRedeemTarget(null);
                    setActiveTab("mine");
                }}
            />
        </div>
    );
};

export default VouchersPage;
