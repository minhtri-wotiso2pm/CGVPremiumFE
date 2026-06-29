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

/* ── Placeholder sub-pages ── */
export const TicketsPage: FC = () => (
    <ProfilePlaceholder
        icon="🎫"
        title="My Tickets"
        subtitle="All your booked and past movie tickets will appear here. Book your first movie now!"
    />
);

export const MembershipPage: FC = () => (
    <ProfilePlaceholder
        icon="⭐"
        title="Membership"
        subtitle="View your membership tier, points history, and exclusive VIP benefits."
    />
);

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
