import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, Skeleton, Badge } from "antd";
import { EditOutlined, LockOutlined, StarFilled } from "@ant-design/icons";
import type { ProfileResponse } from "../types/profile.type";
import {
    buildInitialsAvatar,
    formatMemberSince,
    // mapRole,
    mapStatusColor,
    capitalize,
    formatTierName,
    getTierColor,
} from "../utils/profile.mapper";
import { useMembershipInfo } from "../hooks/useMembership";
import Barcode from "@/components/ui/Barcode";
import { formatNumber } from "@/utils/formatCurrency";
import styles from "./ProfileCard.module.css";

interface Props {
    profile: ProfileResponse | undefined;
    loading: boolean;
    onEdit: () => void;
    onAvatar: () => void;
    onChangePassword: () => void;
}

const ProfileCard: FC<Props> = ({ profile, loading, onEdit, onAvatar, onChangePassword }) => {
    const { t } = useTranslation("profile");
    const { data: membership } = useMembershipInfo();

    if (loading || !profile) {
        return (
            <div className={styles.skeletonWrap}>
                <div className={styles.skeletonHero} />
                <div className={styles.skeletonBody}>
                    <Skeleton.Avatar active size={108} className={styles.skeletonAvatar} />
                    <Skeleton active paragraph={{ rows: 4 }} title={{ width: 160 }} />
                </div>
            </div>
        );
    }

    const avatarSrc = profile.avatarURL ?? buildInitialsAvatar(profile.fullName);

    return (
        <div className={styles.card}>
            {/* ── Hero banner ── */}
            <div className={styles.hero}>
                <div className={styles.heroGlow} />
                <div className={styles.heroLines} />
                <div className={styles.heroBtnGroup}>
                    <Button
                        icon={<EditOutlined />}
                        onClick={onEdit}
                        className={styles.heroBtn}
                        aria-label={t("card.editProfile")}
                    >
                        {t("card.editProfile")}
                    </Button>
                    <Button
                        icon={<LockOutlined />}
                        onClick={onChangePassword}
                        className={styles.heroBtn}
                        aria-label={t("card.changePassword")}
                    >
                        {t("card.changePassword")}
                    </Button>
                </div>
            </div>

            {/* ── Avatar + identity ── */}
            <div className={styles.identity}>
                <div className={styles.avatarWrap}>
                    <img src={avatarSrc} alt={profile.fullName} className={styles.avatar} />
                    <button
                        className={styles.avatarBtn}
                        onClick={onAvatar}
                        aria-label={t("card.changeAvatar")}
                        type="button"
                    >
                        <EditOutlined style={{ fontSize: 11 }} />
                    </button>
                </div>
                <h2 className={styles.name}>{profile.fullName}</h2>
                {membership ? (() => {
                    const color = getTierColor(membership.currentTier);
                    return (
                        <span
                            className={styles.memberBadge}
                            style={{
                                color,
                                background: `${color}10`,
                                borderColor: `${color}3d`,
                                boxShadow: `0 0 14px ${color}14`,
                            }}
                        >
                            {t("sidebar.tierMember", { tier: formatTierName(membership.currentTier) })}
                        </span>
                    );
                })() : (
                    <span className={styles.memberBadge}>{t("sidebar.member")}</span>
                )}
            </div>

            {/* ── Info grid ── */}
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t("card.email")}</span>
                    <span className={styles.infoValue}>{profile.email}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t("card.phone")}</span>
                    <span className={styles.infoValue}>{profile.phone || "—"}</span>
                </div>
                {/* <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Role</span>
                    <span className={styles.infoValue}>{mapRole(profile.role)}</span>
                </div> */}
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t("card.memberSince")}</span>
                    <span className={styles.infoValue}>{formatMemberSince(profile.createdAt)}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t("card.status")}</span>
                    <Badge
                        status={mapStatusColor(profile.status) as "success" | "error" | "warning" | "default"}
                        text={capitalize(profile.status)}
                        className={styles.statusBadge}
                    />
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t("card.membership")}</span>
                    {membership ? (
                        <span
                            className={styles.infoValue}
                            style={{ color: getTierColor(membership.currentTier), fontWeight: 700 }}
                        >
                            {formatTierName(membership.currentTier)}
                        </span>
                    ) : (
                        <span className={styles.infoValue}>—</span>
                    )}
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t("card.refundsRemaining")}</span>
                    <span className={styles.infoValue}>
                        {Math.max(0, profile.total_refunds - profile.used_refunds)} / {profile.total_refunds}
                    </span>
                </div>
            </div>

            {/* ── Points ── */}
            <div className={styles.pointsSection}>
                <div className={styles.pointsMeta}>
                    <StarFilled className={styles.pointsStar} />
                    <div>
                        <p className={styles.pointsLabel}>{t("card.totalPoints")}</p>
                        <p className={styles.pointsHint}>{t("card.pointsHint")}</p>
                    </div>
                </div>
                <span className={styles.points}>{formatNumber(profile.totalPoints)}</span>
            </div>

            {/* ── Membership barcode ── */}
            {profile.barcode && (
                <div className={styles.barcodeSection}>
                    <p className={styles.barcodeLabel}>{t("card.membershipCard")}</p>
                    <div className={styles.barcodePanel}>
                        <Barcode value={profile.barcode} height={62} />
                        <span className={styles.barcodeCode}>{profile.barcode}</span>
                    </div>
                    <p className={styles.barcodeHint}>{t("card.barcodeHint")}</p>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
