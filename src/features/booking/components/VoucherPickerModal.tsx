import { useMemo, useState, type FC } from "react";
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

const fmtPoints = (n: number) => n.toLocaleString("en-US");

const isUnexpired = (expiredAt: string | null): boolean =>
    !expiredAt || new Date(expiredAt).getTime() > Date.now();

/** Lets a signed-in customer pick an already-redeemed voucher, redeem a new
 *  one with points, or apply a public promo code — all without leaving
 *  checkout (and its seat-hold timer). */
const VoucherPickerModal: FC<Props> = ({ open, onClose, onSelect }) => {
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

    // /vouchers/my-vouchers already only returns vouchers with at least one
    // usable copy — this is just a defensive expiry check on top of that.
    const available = useMemo(
        () => myVouchers.filter((v) => isUnexpired(v.expiredAt)),
        [myVouchers],
    );
    const eligibleRedeemable = useMemo(
        () => redeemable.filter((v) => isWithinValidityWindow(v.validFrom, v.validUntil)),
        [redeemable],
    );
    const publicVouchers = useMemo(() => {
        const now = dayjs();
        return (publicData?.items ?? []).filter(
            (v) => v.isActive && !v.isRedeemable && (!v.validUntil || dayjs(v.validUntil).isAfter(now)),
        );
    }, [publicData]);

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

    const items = [
        {
            key: "mine",
            label: "My Vouchers",
            children: myVouchersLoading ? (
                <p className={styles.empty}>Loading your vouchers…</p>
            ) : available.length === 0 ? (
                <p className={styles.empty}>You don't have any vouchers ready to use yet.</p>
            ) : (
                <div className={styles.list}>
                    {available.map((v) => (
                        <button key={v.voucherCode} type="button" className={styles.row} onClick={() => applyCode(v.voucherCode)}>
                            {v.imageUrl ? (
                                <img src={v.imageUrl} alt="" className={styles.rowThumb} />
                            ) : (
                                <div className={styles.rowThumbPh}><GiftIcon size={18} /></div>
                            )}
                            <div className={styles.rowInfo}>
                                <span className={styles.rowDiscount}>
                                    {fmtDiscount(v.discountType, v.discountValue)}
                                    {v.quantity > 1 ? ` · ×${v.quantity}` : ""}
                                </span>
                                <span className={styles.rowCode}>{v.voucherCode}</span>
                            </div>
                            <span className={styles.rowAction}>Use</span>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            key: "public",
            label: "Available Promos",
            children: publicLoading ? (
                <p className={styles.empty}>Loading promotions…</p>
            ) : publicVouchers.length === 0 ? (
                <p className={styles.empty}>No public promotions right now.</p>
            ) : (
                <div className={styles.list}>
                    {publicVouchers.map((v) => (
                        <button key={v.voucherId} type="button" className={styles.row} onClick={() => applyCode(v.voucherCode)}>
                            {v.imageUrl ? (
                                <img src={v.imageUrl} alt="" className={styles.rowThumb} />
                            ) : (
                                <div className={styles.rowThumbPh}><GiftIcon size={18} /></div>
                            )}
                            <div className={styles.rowInfo}>
                                <span className={styles.rowDiscount}>
                                    {fmtDiscount(v.discountType, v.discountValue)}
                                </span>
                                <span className={styles.rowCode}>{v.voucherCode}</span>
                            </div>
                            <span className={styles.rowAction}>Use</span>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            key: "redeem",
            label: "Redeem with Points",
            children: redeemableLoading ? (
                <p className={styles.empty}>Loading vouchers…</p>
            ) : eligibleRedeemable.length === 0 ? (
                <p className={styles.empty}>Nothing to redeem right now.</p>
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
                                <div className={styles.rowInfo}>
                                    <span className={styles.rowDiscount}>
                                        {fmtDiscount(v.discountType, v.discountValue)}
                                    </span>
                                    <span className={styles.rowPoints}>
                                        <StarPointsIcon size={12} /> {fmtPoints(v.requiredPoints)} pts
                                    </span>
                                </div>
                                {canAfford ? (
                                    <Button className={styles.redeemBtn} onClick={() => handleRedeem(v)}>
                                        Redeem
                                    </Button>
                                ) : (
                                    <Tooltip title={`You need ${fmtPoints(gap)} more points.`}>
                                        <span className={styles.needMoreChip}>
                                            <LockIcon size={11} /> {fmtPoints(gap)} more
                                        </span>
                                    </Tooltip>
                                )}
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
                        <span className={styles.title}>Choose a Voucher</span>
                        <span className={styles.pointsPill}>
                            <StarPointsIcon size={14} /> {fmtPoints(totalPoints)} pts
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
