import type { FC } from "react";
import { Outlet } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileBreadcrumb from "../components/ProfileBreadcrumb";
import ProfilePlaceholder from "../components/ProfilePlaceholder";
import styles from "./CustomerProfileLayout.module.css";

/* ── Layout ── */
export const CustomerProfileLayout: FC = () => (
    <div className={styles.page}>
        <div className={styles.layout}>
            <ProfileSidebar />
            <main className={styles.content} id="profile-main">
                <ProfileBreadcrumb />
                <Outlet />
            </main>
        </div>
    </div>
);

/* ── Sub-pages ── */
export { default as TicketsPage } from "./MyTicketsPage";

export { default as MembershipPage } from "./MembershipPage";

export const WalletPage: FC = () => (
    <ProfilePlaceholder
        icon="💳"
        title="EGift Wallet"
        subtitle="Manage your digital gift cards, credits, and redeem rewards with ease."
    />
);

export const SettingsPage: FC = () => (
    <ProfilePlaceholder
        icon="⚙️"
        title="Settings"
        subtitle="Manage notification preferences, privacy settings, and account security."
    />
);
