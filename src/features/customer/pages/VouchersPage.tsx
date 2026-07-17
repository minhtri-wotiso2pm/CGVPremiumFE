import { useState, type FC } from "react";
import { Tabs, Button } from "antd";
import { useMembershipInfo } from "../hooks/useMembership";
import { useRedeemableVouchers, useMyVouchers } from "../hooks/useLoyaltyVouchers";
import RedeemableVoucherCard from "../components/RedeemableVoucherCard";
import MyVoucherCard from "../components/MyVoucherCard";
import RedeemConfirmModal from "../components/RedeemConfirmModal";
import type { RedeemableVoucher } from "../types/loyaltyVoucher.types";
import cardStyles from "../components/VoucherCard.module.css";
import styles from "./VouchersPage.module.css";

const VouchersPage: FC = () => {
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

    const items = [
        {
            key: "redeem",
            label: "Redeem with Points",
            children: redeemableLoading ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateText}>Loading vouchers…</p>
                </div>
            ) : redeemableError ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>Failed to load</p>
                    <p className={styles.stateText}>Could not load redeemable vouchers.</p>
                    <Button className={styles.retryBtn} onClick={() => refetchRedeemable()}>Retry</Button>
                </div>
            ) : redeemable.length === 0 ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>Nothing to redeem right now</p>
                    <p className={styles.stateText}>Check back soon — new rewards are added regularly.</p>
                </div>
            ) : (
                <div className={cardStyles.grid}>
                    {redeemable.map((v) => (
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
            label: "My Vouchers",
            children: myVouchersLoading ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateText}>Loading your vouchers…</p>
                </div>
            ) : myVouchersError ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>Failed to load</p>
                    <p className={styles.stateText}>Could not load your vouchers.</p>
                    <Button className={styles.retryBtn} onClick={() => refetchMyVouchers()}>Retry</Button>
                </div>
            ) : myVouchers.length === 0 ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>No vouchers yet</p>
                    <p className={styles.stateText}>Redeem your points on the other tab to get your first voucher.</p>
                </div>
            ) : (
                <div className={cardStyles.grid}>
                    {myVouchers.map((v) => (
                        <MyVoucherCard key={v.userVoucherId} voucher={v} />
                    ))}
                </div>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Vouchers</h1>
                <p className={styles.subtitle}>
                    Exchange your points for discounts, and keep track of the vouchers you own.
                </p>
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
