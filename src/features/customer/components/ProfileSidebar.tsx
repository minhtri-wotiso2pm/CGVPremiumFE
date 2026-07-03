import { useState, type FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Popconfirm, Drawer, Button } from "antd";
import {
    UserOutlined, TagOutlined, StarOutlined,
    WalletOutlined, SettingOutlined, LogoutOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/store/hooks";
import { useLogout } from "@/features/auth/hooks/useLogoutMutation";
import { SIDEBAR_NAV_ITEMS } from "../constants/profile.constants";
import { buildInitialsAvatar, formatTierName, getTierColor } from "../utils/profile.mapper";
import { useMembershipInfo } from "../hooks/useMembership";
import styles from "./ProfileSidebar.module.css";

/* ─── Icon map ─── */
const ICON_MAP: Record<string, React.ReactNode> = {
    user: <UserOutlined />,
    ticket: <TagOutlined />,
    star: <StarOutlined />,
    wallet: <WalletOutlined />,
    settings: <SettingOutlined />,
};

/* ─── Sidebar Content ─── */
interface SidebarContentProps { onNavigate?: () => void }

const SidebarContent: FC<SidebarContentProps> = ({ onNavigate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector((state) => state.auth.user);
    const { mutate: logoutMutate, isPending: loggingOut } = useLogout();
    const { data: membership } = useMembershipInfo();

    const avatarSrc = user?.avatarURL ?? buildInitialsAvatar(user?.fullName ?? "U");

    const handleNav = (path: string) => {
        navigate(path);
        onNavigate?.();
    };

    const handleLogout = () => logoutMutate();

    return (
        <div className={styles.inner}>
            {/* User card */}
            <div className={styles.userCard}>
                <img src={avatarSrc} alt={user?.fullName} className={styles.avatar} />
                <div className={styles.userInfo}>
                    <p className={styles.userName}>{user?.fullName ?? "—"}</p>
                    <p className={styles.userEmail}>{user?.email ?? ""}</p>
                    {membership ? (() => {
                        const color = getTierColor(membership.currentTier);
                        return (
                            <span
                                className={styles.memberBadge}
                                style={{
                                    color,
                                    background: `${color}10`,
                                    borderColor: `${color}3d`,
                                    boxShadow: `0 0 10px ${color}0f`,
                                }}
                            >
                                {formatTierName(membership.currentTier)} Member
                            </span>
                        );
                    })() : (
                        <span className={styles.memberBadge}>Member</span>
                    )}
                </div>
            </div>

            {/* Nav items */}
            <nav aria-label="Profile navigation">
                <ul className={styles.navList}>
                    {SIDEBAR_NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.key}>
                                <button
                                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                                    onClick={() => handleNav(item.path)}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <span className={styles.navIcon}>{ICON_MAP[item.icon]}</span>
                                    {item.label}
                                    {isActive && <span className={styles.activeBar} aria-hidden />}
                                </button>
                            </li>
                        );
                    })}

                    {/* Logout */}
                    <li className={styles.logoutItem}>
                        <Popconfirm
                            title={<span style={{ color: "#f0e8e8", fontWeight: 600 }}>Sign out</span>}
                            description={<span style={{ color: "#9a7070" }}>Are you sure you want to sign out?</span>}
                            onConfirm={handleLogout}
                            okText="Sign Out"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true, loading: loggingOut }}
                            cancelButtonProps={{ style: { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "#9a7070" } }}
                            disabled={loggingOut}
                            placement="right"
                            overlayInnerStyle={{ background: "#1a0f0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                        >
                            <button className={`${styles.navItem} ${styles.navItemLogout}`} type="button" disabled={loggingOut}>
                                <span className={styles.navIcon}><LogoutOutlined /></span>
                                {loggingOut ? "Signing out…" : "Sign Out"}
                            </button>
                        </Popconfirm>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

/* ─── Main export (desktop sticky + mobile drawer) ─── */
const ProfileSidebar: FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            {/* Desktop */}
            <aside className={styles.sidebarDesktop} aria-label="Account sidebar">
                <SidebarContent />
            </aside>

            {/* Mobile hamburger */}
            <div className={styles.mobileToggle}>
                <Button
                    icon={<MenuOutlined />}
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open navigation menu"
                    style={{ background: "rgba(232,0,28,0.1)", border: "1px solid rgba(232,0,28,0.3)", color: "#E8001C" }}
                />
            </div>

            {/* Mobile drawer */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                placement="left"
                width={280}
                styles={{ body: { padding: 0, background: "#0d0303" }, header: { background: "#0d0303", borderBottom: "1px solid rgba(255,255,255,0.06)" } }}
                title={
                    <span style={{ color: "#f0e8e8", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.04em" }}>
                        My Account
                    </span>
                }
            >
                <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </Drawer>
        </>
    );
};

export default ProfileSidebar;